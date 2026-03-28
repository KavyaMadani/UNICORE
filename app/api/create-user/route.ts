import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/create-user
// Body: { email, password, name, role, college, college_id?, organization_id? }
// Called by: Admin (creating organizers) and Organizer (creating managers)
// Auth: Caller must be authenticated with correct role

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, college, college_id, created_by_role } = body;

    // Validate inputs
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields: email, password, name, role' }, { status: 400 });
    }
    if (!['organizer', 'organization', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be organizer, organization, or manager.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Map 'organizer' to 'organization' for DB
    const dbRole = role === 'organizer' ? 'organization' : role;

    // 1. Create the auth user via admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email, no verification needed
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User created but no ID returned.' }, { status: 500 });
    }

    // 2. Upsert the profile with the correct role
    // (The handle_new_user trigger may have already created it as 'student' — upsert overwrites)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email,
      name,
      role: dbRole,
      college: college ?? null,
    }, { onConflict: 'id' });

    if (profileError) {
      // Cleanup: delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create profile: ' + profileError.message }, { status: 500 });
    }

    // 3. Force role update (trigger might have set it to 'student' — override it)
    await supabaseAdmin.from('profiles').update({ role: dbRole }).eq('id', userId);

    // 4. If creating an organizer, also add to organizations table so it shows in admin list
    if (dbRole === 'organization') {
      await supabaseAdmin.from('organizations').insert([{
        name,
        email,
        college: college ?? null,
        contact_person: name,
        status: 'active',
      }]);
      // Non-fatal: don't block if this fails
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, email, name, role: dbRole },
      message: `${dbRole === 'organization' ? 'Organizer' : 'Event Manager'} account created successfully.`
    });


  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

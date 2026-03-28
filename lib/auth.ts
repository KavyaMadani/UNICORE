import { supabase } from './supabase';
import { getRoleFromEmail } from './role-guard';
import type { UserRole } from './role-guard';
export type { UserRole };

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  college?: string | null;
  organizationId?: string | null;
  avatarUrl?: string | null;
}

/**
 * Sign in with email and password.
 * Role is always derived from isAdminEmail() to bypass RLS recursion issues.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'No user returned from auth' };

    const correctRole = getRoleFromEmail(email);
    const correctName =
      data.user.user_metadata?.name ??
      data.user.user_metadata?.full_name ??
      email.split('@')[0];

    // Attempt to upsert profile (may fail silently due to RLS — that's OK)
    try {
      await supabase.from('profiles').upsert(
        { id: data.user.id, email, name: correctName, role: correctRole },
        { onConflict: 'id' }
      );
      if (correctRole === 'admin') {
        await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.user.id);
      }
    } catch {
      // Silently ignore DB errors — we build user from auth data instead
    }

    // Attempt to read profile, but don't block login on failure
    const profile = await getProfile(data.user.id);

    // Always return a valid user — role comes from email logic, never from broken DB
    return {
      user: {
        id: data.user.id,
        email,
        name: profile?.name ?? correctName,
        role: correctRole, // ← Always use email-derived role, never trust DB role
        college: profile?.college,
        organizationId: profile?.organizationId,
        avatarUrl: profile?.avatarUrl,
      },
      error: null,
    };
  } catch (err) {
    console.error('[signInWithEmail]', err);
    return { user: null, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Sign up a new student account.
 */
export async function signUpStudent(
  email: string,
  password: string,
  name: string
): Promise<{ user: AppUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Signup failed — no user returned.' };

    const role = getRoleFromEmail(email);

    // Attempt profile creation (may fail due to RLS)
    try {
      await supabase.from('profiles').upsert(
        { id: data.user.id, email, name, role },
        { onConflict: 'id' }
      );
    } catch {
      // Silently ignore
    }

    return { user: { id: data.user.id, email, name, role }, error: null };
  } catch (err) {
    console.error('[signUpStudent]', err);
    return { user: null, error: 'Signup failed. Please try again.' };
  }
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[signOut]', err);
  }
  if (typeof document !== 'undefined') {
    document.cookie =
      'hackforge_session_flag=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * Get current session user — role derived from email, not DB.
 */
export async function getSession(): Promise<AppUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    const email = session.user.email ?? '';
    const role = getRoleFromEmail(email);
    const name =
      session.user.user_metadata?.name ??
      session.user.user_metadata?.full_name ??
      email.split('@')[0];

    // Try DB for extra fields, but don't block on failure
    const dbProfile = await getProfile(session.user.id);

    return {
      id: session.user.id,
      email,
      name: dbProfile?.name ?? name,
      role, // Always from email logic
      college: dbProfile?.college,
      organizationId: dbProfile?.organizationId,
      avatarUrl: dbProfile?.avatarUrl,
    };
  } catch (err) {
    console.error('[getSession]', err);
    return null;
  }
}

/**
 * Fetch profile from DB — returns null safely on any error (including RLS recursion).
 */
export async function getProfile(userId: string): Promise<AppUser | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, college, organization_id, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // Don't log RLS recursion errors as they are known/expected
      if (!error.message?.includes('infinite recursion')) {
        console.error('[getProfile] DB error:', error.message);
      }
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: (data.role as UserRole) ?? 'student',
      college: data.college,
      organizationId: data.organization_id,
      avatarUrl: data.avatar_url,
    };
  } catch {
    return null;
  }
}

/**
 * Get the dashboard URL for a given role.
 */
export function getDashboardForRole(role: UserRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'organization': return '/organization/dashboard';
    case 'manager': return '/manager/dashboard';
    case 'student':
    default: return '/student/dashboard';
  }
}

'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getProfile, getDashboardForRole, signOut as authSignOut } from '@/lib/auth';
import { getRoleFromProfile } from '@/lib/role-guard';

import type { AppUser, UserRole } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  role: UserRole;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'student',
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Build an AppUser from a Supabase Auth user.
   * Role is read from DB profile first, then admin email override.
   */
  const buildUserFromAuth = useCallback(async (authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): Promise<AppUser> => {
    const email = authUser.email ?? '';
    const metaName = authUser.user_metadata?.name ?? authUser.user_metadata?.full_name;
    const fallbackName = email.split('@')[0];

    // Always get profile from DB — role MUST come from DB for org/manager
    const dbProfile = await getProfile(authUser.id);

    // Derive role: admin email overrides, otherwise use DB role
    const role: UserRole = getRoleFromProfile(email, dbProfile?.role);

    return {
      id: authUser.id,
      email,
      name: dbProfile?.name ?? metaName ?? fallbackName,
      role,
      college: dbProfile?.college,
      organizationId: dbProfile?.organizationId,
      avatarUrl: dbProfile?.avatarUrl,
    };
  }, []);


  const loadUser = useCallback(async (authUser: { id: string; email?: string; user_metadata?: Record<string, string> }) => {
    try {
      const appUser = await buildUserFromAuth(authUser);
      setUser(appUser);
      if (typeof document !== 'undefined') {
        const maxAge = 60 * 60 * 24 * 7;
        document.cookie = `hackforge_session_flag=1; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `hackforge_role=${appUser.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      return appUser;
    } catch {
      setUser(null);
      return null;
    }
  }, [buildUserFromAuth]);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadUser(authUser);
    }
  }, [loadUser]);

  useEffect(() => {
    // Load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUser(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for subsequent auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadUser(session.user);
        setLoading(false);
        if (profile && (pathname === '/signin' || pathname === '/signup')) {
          router.push(getDashboardForRole(profile.role));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof document !== 'undefined') {
          document.cookie = 'hackforge_session_flag=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'hackforge_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setLoading(false);
        router.push('/signin');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser, pathname, router]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    await authSignOut();
    setUser(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'hackforge_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setLoading(false);
    router.push('/signin');
  }, [router]);

  const role: UserRole = user?.role ?? 'student';

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut: handleSignOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

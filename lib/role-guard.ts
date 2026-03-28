/**
 * Role Guard — the ONLY place where role logic lives.
 *
 * Admin emails are hardcoded (they bypass Supabase RLS).
 * All other roles come from the `profiles.role` column in Supabase.
 * Manager and Organization roles are assigned in the DB, not by email pattern.
 */

// ─── HARDCODED ADMINS (only these 2 accounts) ─────────────────────────────────
const ADMIN_EMAILS: readonly string[] = [
  'kavyamadani10@gmail.com',
  'hardikparmar8083@gmail.com',
] as const;

export type UserRole = 'admin' | 'organization' | 'manager' | 'student';

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Derives role from DB profile role field.
 * Admin override: if email is in ADMIN_EMAILS, always return 'admin'.
 * Otherwise use the role stored in the DB profile (set when admin assigns role).
 */
export function getRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase().trim();
  if (isAdminEmail(e)) return 'admin';
  // For non-admins, role is determined by DB profile (default: student)
  // This function is only called as a fallback — prefer DB role via getProfile()
  return 'student';
}

/**
 * Derive role from DB profile. Admin email always wins.
 */
export function getRoleFromProfile(email: string, dbRole?: string | null): UserRole {
  const e = email.toLowerCase().trim();
  if (isAdminEmail(e)) return 'admin';
  if (dbRole === 'organization') return 'organization';
  if (dbRole === 'manager') return 'manager';
  return 'student';
}

/**
 * Get all routes accessible for a given role
 */
const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin:        ['/admin', '/organization', '/manager', '/student'],
  organization: ['/organization', '/student'],
  manager:      ['/manager', '/student'],
  student:      ['/student'],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role] ?? ROLE_ROUTES['student'];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export function getUnauthorizedRedirect(role: UserRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'organization': return '/organization/dashboard';
    case 'manager': return '/manager/dashboard';
    default: return '/student/dashboard';
  }
}

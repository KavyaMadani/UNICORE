// ─── HARDCODED ADMIN EMAILS ──────────────────────────────────────────────────
// These are the ONLY place admin emails are stored. Never expose in UI.
const ADMIN_EMAILS: readonly string[] = [
  'kavyamadani10@gmail.com',
  'hardikparmar8083@gmail.com',
] as const;

// ─── DEMO ACCOUNTS WITH FIXED ROLES ──────────────────────────────────────────
// These demo accounts are used for testing/demo purposes.
// Passwords are set in Supabase Auth — see credentials below.
const MANAGER_EMAILS: readonly string[] = [
  'manager@hackforge.dev',
  'rajesh.mgr@iitb.ac.in',
  'ananya.mgr@iitd.ac.in',
  'rahul.mgr@iitb.ac.in',
] as const;

const ORGANIZATION_EMAILS: readonly string[] = [
  'org@hackforge.dev',
  'tech@iitb.ac.in',
  'innovation@iitd.ac.in',
  'hackathon@bits-pilani.ac.in',
] as const;

export type UserRole = 'admin' | 'organization' | 'manager' | 'student';

/**
 * Returns true if the email is a hardcoded platform admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Returns true if the email is a manager demo account
 */
export function isManagerEmail(email: string): boolean {
  return MANAGER_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Returns true if the email is an organization demo account
 */
export function isOrganizationEmail(email: string): boolean {
  return ORGANIZATION_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Derives the correct role from an email address.
 * Priority: admin > organization > manager > student
 */
export function getRoleFromEmail(email: string): UserRole {
  const e = email.toLowerCase().trim();
  if (isAdminEmail(e)) return 'admin';
  if (isOrganizationEmail(e)) return 'organization';
  if (isManagerEmail(e)) return 'manager';
  return 'student';
}

/**
 * Get all routes that are accessible for a given role (hierarchical)
 */
const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ['/admin', '/organization', '/manager', '/student'],
  organization: ['/organization', '/student'],
  manager: ['/manager', '/student'],
  student: ['/student'],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const allowed = ROLE_ROUTES[role] ?? ROLE_ROUTES['student'];
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Get the redirect path for unauthorized access
 */
export function getUnauthorizedRedirect(role: UserRole): string {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'organization': return '/organization/dashboard';
    case 'manager': return '/manager/dashboard';
    default: return '/student/dashboard';
  }
}

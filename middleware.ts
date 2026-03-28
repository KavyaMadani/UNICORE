import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/signin', '/signup', '/api', '/_next', '/favicon'];
const PROTECTED_PREFIXES = ['/admin', '/organization', '/manager', '/student'];

// Each route prefix → which roles are allowed
const ROLE_REQUIRED: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin',        roles: ['admin'] },
  { prefix: '/organization', roles: ['admin', 'organization'] },
  { prefix: '/manager',      roles: ['admin', 'organization', 'manager'] },
  { prefix: '/student',      roles: ['admin', 'organization', 'manager', 'student'] },
];

function getDashboard(role: string): string {
  if (role === 'admin')        return '/admin/dashboard';
  if (role === 'organization') return '/organization/dashboard';
  if (role === 'manager')      return '/manager/dashboard';
  return '/student/dashboard';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Must be signed in
  const sessionCookie = request.cookies.get('hackforge_session_flag');
  if (!sessionCookie?.value) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // Role-based guard — read role from cookie set during sign-in
  const role = request.cookies.get('hackforge_role')?.value ?? 'student';
  const entry = ROLE_REQUIRED.find(r => pathname.startsWith(r.prefix));
  if (entry && !entry.roles.includes(role)) {
    return NextResponse.redirect(new URL(getDashboard(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)',
  ],
};

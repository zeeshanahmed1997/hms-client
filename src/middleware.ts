import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

interface CustomJWTPayload extends JWTPayload {
  // Microsoft/ASP.NET Identity claim for role
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  role?: string;
  user?: {
    role?: string;
  };
  roles?: string[];
  // Add other claims you might need
  email?: string;
  fullName?: string;
  sub?: string;
}

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const ROLE_BASE_PATHS: Record<string, string> = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('hms_auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify<CustomJWTPayload>(token, SECRET);

    // Extract role — no `as any` needed anymore
    let rawRole =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload.role ||
      payload.user?.role ||
      payload.roles?.[0] ||
      'guest';

    const role = String(rawRole).toLowerCase().trim();

    const headers = new Headers(request.headers);
    headers.set('x-user-role', role);

    const response = NextResponse.next({
      request: { headers },
    });

    // Protect role-specific paths
    for (const [allowedRole, basePath] of Object.entries(ROLE_BASE_PATHS)) {
      if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
        if (role !== allowedRole) {
          const redirectTo = role !== 'guest' ? `/${role}` : '/login';
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
      }
    }

    // Redirect from root to user dashboard
    if (pathname === '/') {
      if (role !== 'guest' && role in ROLE_BASE_PATHS) {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      if (role === 'guest') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // response.cookies.delete('hms_auth_token', { path: '/' });
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico).*)',
  ],
};
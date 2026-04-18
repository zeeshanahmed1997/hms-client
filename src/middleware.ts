import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload, errors as joseErrors } from 'jose';

interface CustomJWTPayload extends JWTPayload {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  role?: string;
  user?: {
    role?: string;
  };
  roles?: string[];
  email?: string;
  fullName?: string;
  sub?: string;
}

let SECRET: Uint8Array;

{
  const secretStr = process.env.JWT_SECRET;

  if (!secretStr || secretStr.trim() === '') {
    console.error('CRITICAL: JWT_SECRET is missing or empty in environment variables.');
    SECRET = new Uint8Array(0);
  } else {
    const trimmed = secretStr.trim();
    if (trimmed.length < 32) {
      console.warn(`[JWT Warning] Secret is short (${trimmed.length} chars).`);
    }
    SECRET = new TextEncoder().encode(trimmed);
  }
}

const ROLE_BASE_PATHS: Record<string, string> = {
  admin:   '/admin',
  doctor:  '/doctor',
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
    if (SECRET.length === 0) {
      throw new Error('JWT secret is empty');
    }

    const { payload } = await jwtVerify<CustomJWTPayload>(token, SECRET);

    let rawRole =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload.role ||
      payload.user?.role ||
      (payload.roles && payload.roles[0]) ||
      'guest';

    const role = String(rawRole).toLowerCase().trim();

    const headers = new Headers(request.headers);
    headers.set('x-user-role', role);

    const response = NextResponse.next({
      request: { headers },
    });

    for (const [allowedRole, basePath] of Object.entries(ROLE_BASE_PATHS)) {
      if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
        if (role !== allowedRole) {
          const redirectPath = role !== 'guest' ? `/${role}` : '/login';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }
    }

    if (pathname === '/') {
      if (role !== 'guest' && role in ROLE_BASE_PATHS) {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      if (role === 'guest') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return response;
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico|.*\\..*).*)',
  ],
};
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // npm install jose

const protectedPaths = ['/dashboard', '/appointments', '/patients'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
   
  const token = request.cookies.get('hms_auth_token')?.value;

  // Check if the current path is protected
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
         
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    try {
         
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
         
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('hms_auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Optimized Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (if you want to handle API auth separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, signup, forgot-password (public auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|signup|forgot-password).*)',
  ],
};
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken');
  
  if (!token && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/register' && request.nextUrl.pathname !== '/' && request.nextUrl.pathname !== '/forgot-password' && request.nextUrl.pathname !== '/reset-password') {
    // If trying to access protected route without token, redirect to login
    // Exception: Landing page, login, register, forgot-password, reset-password are public
    if (request.nextUrl.pathname.startsWith('/dashboard') || 
        request.nextUrl.pathname.startsWith('/chat') || 
        request.nextUrl.pathname.startsWith('/appointments') ||
        request.nextUrl.pathname.startsWith('/profile')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/appointments/:path*', '/profile/:path*']
};

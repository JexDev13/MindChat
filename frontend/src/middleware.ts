import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeJwt } from "jose";

// Paths that don't require authentication
const publicPaths = ["/", "/login", "/register", "/forgot-password"];

/**
 * Decode JWT payload for routing purposes.
 * 
 * SECURITY NOTE: We use decodeJwt (no signature verification) because:
 * 1. The backend verifies JWT signatures on ALL API requests
 * 2. This middleware only handles client-side routing/redirects
 * 3. No sensitive operations are performed based on this decode
 * 4. If someone tampers with the token, API calls will fail with 401
 */
const decodeTokenPayload = (token: string) => {
  try {
    return decodeJwt(token);
  } catch {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths exactly
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("mindchat_auth_token")?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    // Only redirect if it's a dashboard route
    if (pathname.startsWith("/dashboard")) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Decode token to get role
  const payload = decodeTokenPayload(token);
  
  // If token is invalid or expired, let the client handle it
  // Don't force logout here - the AuthProvider will handle it
  if (!payload) {
    return NextResponse.next();
  }

  // Check if token is expired
  const exp = payload.exp as number;
  if (exp && Date.now() >= exp * 1000) {
    // Token expired - let client handle the refresh/logout
    return NextResponse.next();
  }

  const role = payload.role as string;

  // Handle dashboard routing based on role
  if (pathname.startsWith("/dashboard")) {
    // Redirect /dashboard to the correct role-based path
    if (pathname === "/dashboard") {
      const redirectPath = role === "Psychologist" 
        ? "/dashboard/psychologist" 
        : "/dashboard/patient";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Prevent cross-role access
    if (pathname.startsWith("/dashboard/psychologist") && role !== "Psychologist") {
      return NextResponse.redirect(new URL("/dashboard/patient", request.url));
    }
    
    if (pathname.startsWith("/dashboard/patient") && role !== "Patient") {
      return NextResponse.redirect(new URL("/dashboard/psychologist", request.url));
    }
  }

  // If authenticated user tries to access login/register, redirect to dashboard
  if (pathname === "/login" || pathname === "/register") {
    const redirectPath = role === "Psychologist" 
      ? "/dashboard/psychologist" 
      : "/dashboard/patient";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};

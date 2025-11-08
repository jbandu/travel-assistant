/**
 * Next.js Middleware
 * Applies security protections to all routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { ddosProtection, rateLimit, RateLimitPresets } from './lib/security/rate-limit';
import { applySecurityHeaders, applyDevelopmentSecurityHeaders } from './lib/security/headers';

export function middleware(request: NextRequest) {
  // Apply DDoS protection to all routes
  const ddosResult = ddosProtection()(request);
  if (ddosResult) {
    return ddosResult;
  }

  // Determine rate limit based on path
  let rateLimitConfig: { interval: number; maxRequests: number } = RateLimitPresets.general;

  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    rateLimitConfig = RateLimitPresets.auth;
  } else if (request.nextUrl.pathname.startsWith('/api/')) {
    // Apply stricter limits to specific sensitive endpoints
    if (request.nextUrl.pathname.includes('/profile') ||
        request.nextUrl.pathname.includes('/companions') ||
        request.nextUrl.pathname.includes('/trip-memories') ||
        request.nextUrl.pathname.includes('/bucket-list')) {
      rateLimitConfig = RateLimitPresets.strict;
    } else {
      rateLimitConfig = RateLimitPresets.api;
    }
  }

  // Apply rate limiting
  const rateLimitResult = rateLimit(rateLimitConfig)(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  // Create response
  const response = NextResponse.next();

  // Apply security headers
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    applyDevelopmentSecurityHeaders(response);
  } else {
    applySecurityHeaders(response);
  }

  return response;
}

// Configure which routes middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Security Headers Configuration
 * Implements comprehensive HTTP security headers
 */

import { NextResponse } from 'next/server';

/**
 * Generate Content Security Policy header
 */
export function generateCSP(): string {
  const policies = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for Next.js
      "'unsafe-inline'", // Required for inline scripts
      'https://cdn.jsdelivr.net', // For external libraries
      'https://unpkg.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:', // Allow all HTTPS images (for travel photos, maps, etc.)
    ],
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    'connect-src': [
      "'self'",
      'https://api.openai.com',
      'https://api.anthropic.com',
      'https://generativelanguage.googleapis.com',
      'https://api.amadeus.com',
      'https://api.mapbox.com',
      'https://api.openweathermap.org',
      'https://api.weatherapi.com',
      'https://api.unsplash.com',
      'https://images.unsplash.com',
      'https://api.pexels.com',
      'https://maps.googleapis.com',
      'https://places.googleapis.com',
    ],
    'frame-src': [
      "'self'",
      'https://www.google.com', // For reCAPTCHA if used
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"], // Prevent clickjacking
    'upgrade-insecure-requests': [],
  };

  return Object.entries(policies)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', generateCSP());

  // Strict Transport Security (HSTS)
  // Tells browsers to only connect via HTTPS for the next year
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Content-Type-Options
  // Prevents MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  // Prevents clickjacking attacks
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  // Enables browser's XSS filter (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  // Controls how much referrer information is sent
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features can be used
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );

  // Cross-Origin-Opener-Policy
  // Protects against cross-origin attacks
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin-Resource-Policy
  // Protects resources from being loaded by other origins
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // X-DNS-Prefetch-Control
  // Controls DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Remove unnecessary headers that expose information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Security headers for development environment
 * More permissive for easier debugging
 */
export function applyDevelopmentSecurityHeaders(response: NextResponse): NextResponse {
  // Less strict CSP for development
  const devCSP = generateCSP().replace("'unsafe-eval'", "'unsafe-eval'");
  response.headers.set('Content-Security-Policy-Report-Only', devCSP);

  // Apply other security headers as normal
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // Less strict for dev
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * CORS headers for API routes
 */
export function applyCORSHeaders(
  response: NextResponse,
  options?: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  }
): NextResponse {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    headers = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
  } = options || {};

  // Access-Control-Allow-Origin
  if (Array.isArray(origin)) {
    // For multiple origins, need to handle dynamically based on request
    response.headers.set('Access-Control-Allow-Origin', origin[0]);
  } else {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  // Access-Control-Allow-Methods
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '));

  // Access-Control-Allow-Headers
  response.headers.set('Access-Control-Allow-Headers', headers.join(', '));

  // Access-Control-Allow-Credentials
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Access-Control-Max-Age (cache preflight for 1 hour)
  response.headers.set('Access-Control-Max-Age', '3600');

  return response;
}

/**
 * Get recommended security headers for Next.js config
 */
export function getNextConfigSecurityHeaders() {
  return [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(self), payment=()',
    },
  ];
}

/**
 * Rate Limiting and DDoS Protection
 * Implements token bucket algorithm for API rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Default rate limit configurations by endpoint type
 */
export const RateLimitPresets = {
  // Very restrictive - for sensitive operations
  strict: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // Authentication endpoints
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // General endpoints
  general: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // Search and read-heavy endpoints
  search: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address, or falls back to other identifiers
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to request IP
  return request.ip || 'unknown';
}

/**
 * Check if request exceeds rate limit
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RateLimitPresets.api
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const clientId = getClientIdentifier(request);
  const key = `${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry exists or reset time passed, create new entry
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.interval,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= config.maxRequests;

  return {
    allowed,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    reset: entry.resetTime,
  };
}

/**
 * Rate limit middleware for API routes
 * Returns 429 Too Many Requests if limit exceeded
 */
export function rateLimit(config?: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const result = checkRateLimit(request, config);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    };

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Allow request but add headers for client awareness
    return null; // null means allow the request to proceed
  };
}

/**
 * Wrapper function to apply rate limiting to API route handlers
 */
export function withRateLimit<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const rateLimitResult = rateLimit(config)(request);

    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Call original handler
    const response = await handler(request, ...args);

    // Add rate limit headers to successful responses
    const result = checkRateLimit(request, config);
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());

    return response;
  };
}

/**
 * DDoS Protection: Detect and block suspicious patterns
 */
export interface DDoSConfig {
  maxRequestsPerSecond: number;
  blockDuration: number; // in milliseconds
}

const ddosBlocklist = new Map<string, number>();
const ddosRequestLog = new Map<string, number[]>();

export function checkDDoS(
  request: NextRequest,
  config: DDoSConfig = {
    maxRequestsPerSecond: 10,
    blockDuration: 5 * 60 * 1000, // 5 minutes
  }
): { blocked: boolean; reason?: string } {
  const clientId = getClientIdentifier(request);
  const now = Date.now();

  // Check if client is currently blocked
  const blockExpiry = ddosBlocklist.get(clientId);
  if (blockExpiry && blockExpiry > now) {
    return {
      blocked: true,
      reason: 'Temporarily blocked due to suspicious activity',
    };
  }

  // Remove expired blocks
  if (blockExpiry && blockExpiry <= now) {
    ddosBlocklist.delete(clientId);
  }

  // Track request timestamps for this client
  let timestamps = ddosRequestLog.get(clientId) || [];
  const oneSecondAgo = now - 1000;

  // Keep only timestamps from last second
  timestamps = timestamps.filter((t) => t > oneSecondAgo);
  timestamps.push(now);
  ddosRequestLog.set(clientId, timestamps);

  // Check if exceeds threshold
  if (timestamps.length > config.maxRequestsPerSecond) {
    ddosBlocklist.set(clientId, now + config.blockDuration);
    return {
      blocked: true,
      reason: `Exceeded ${config.maxRequestsPerSecond} requests per second`,
    };
  }

  return { blocked: false };
}

/**
 * DDoS protection middleware
 */
export function ddosProtection(config?: DDoSConfig) {
  return (request: NextRequest): NextResponse | null => {
    const result = checkDDoS(request, config);

    if (result.blocked) {
      console.warn(`DDoS protection: Blocked request from ${getClientIdentifier(request)}: ${result.reason}`);

      return NextResponse.json(
        {
          error: 'Access denied',
          message: result.reason || 'Suspicious activity detected',
        },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Clear rate limit for a specific client (useful for testing)
 */
export function clearRateLimit(clientId: string, pathname?: string) {
  if (pathname) {
    rateLimitStore.delete(`${clientId}:${pathname}`);
  } else {
    // Clear all entries for this client
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${clientId}:`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Get current rate limit stats (for monitoring/debugging)
 */
export function getRateLimitStats() {
  return {
    totalKeys: rateLimitStore.size,
    blockedClients: ddosBlocklist.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString(),
    })),
  };
}

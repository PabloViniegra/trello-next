/**
 * Simple in-memory rate limiter for development and small-scale production.
 * For production at scale, replace with Redis-based solution (e.g., @upstash/ratelimit).
 */

type TRateLimitEntry = {
  count: number
  resetTime: number
}

type TRateLimitConfig = {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
}

type TRateLimitResult = {
  success: boolean
  remaining: number
  resetIn: number
}

class RateLimiter {
  private store = new Map<string, TRateLimitEntry>()

  constructor() {
    // Clean up expired entries every minute
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000)
    }
  }

  /**
   * Check if a request should be allowed based on the identifier.
   */
  check(identifier: string, config: TRateLimitConfig): TRateLimitResult {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // No existing entry or expired window
    if (!entry || now >= entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      })
      return {
        success: true,
        remaining: config.limit - 1,
        resetIn: config.windowMs,
      }
    }

    // Within window, check limit
    if (entry.count >= config.limit) {
      return {
        success: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
      }
    }

    // Increment counter
    entry.count++
    return {
      success: true,
      remaining: config.limit - entry.count,
      resetIn: entry.resetTime - now,
    }
  }

  /**
   * Remove expired entries to prevent memory leaks.
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Clear all entries (useful for testing).
   */
  clear(): void {
    this.store.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

// Pre-configured rate limiters for common use cases
export const authRateLimit = {
  /**
   * Rate limit for login attempts: 5 attempts per minute per IP.
   */
  signIn: (identifier: string): TRateLimitResult =>
    rateLimiter.check(`signin:${identifier}`, {
      limit: 5,
      windowMs: 60 * 1000, // 1 minute
    }),

  /**
   * Rate limit for signup attempts: 3 attempts per minute per IP.
   */
  signUp: (identifier: string): TRateLimitResult =>
    rateLimiter.check(`signup:${identifier}`, {
      limit: 3,
      windowMs: 60 * 1000, // 1 minute
    }),

  /**
   * Rate limit for email verification: 10 attempts per hour per IP.
   */
  verifyEmail: (identifier: string): TRateLimitResult =>
    rateLimiter.check(`verify:${identifier}`, {
      limit: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
    }),
}

export const apiRateLimit = {
  /**
   * General API rate limit: 100 requests per minute per user.
   */
  general: (identifier: string): TRateLimitResult =>
    rateLimiter.check(`api:${identifier}`, {
      limit: 100,
      windowMs: 60 * 1000, // 1 minute
    }),

  /**
   * Rate limit for creating resources: 30 per minute per user.
   */
  create: (identifier: string): TRateLimitResult =>
    rateLimiter.check(`create:${identifier}`, {
      limit: 30,
      windowMs: 60 * 1000, // 1 minute
    }),
}

export { rateLimiter }

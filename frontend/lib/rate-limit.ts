// NOTE: In-memory rate limiter. Suitable for single-instance deployments.
// For multi-instance or serverless (Vercel), use an external store (Redis, Upstash)
// or a dedicated service (Vercel Rate Limiting, Cloudflare Rate Limiting).
// WARNING: This implementation relies on IP addresses which can be spoofed if the deployment
// environment doesn't strip external X-Forwarded-For headers securely.

export class RateLimiter {
  private ipCache = new Map<string, { count: number; resetTime: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 3, windowMs: number = 3600000) {
    this.limit = limit;
    this.windowMs = windowMs;

    // Periodically clean up expired entries to prevent memory leaks
    const cleanupInterval = Math.min(windowMs, 60 * 60 * 1000); // max 1 hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.ipCache.entries()) {
        if (now > record.resetTime) {
          this.ipCache.delete(key);
        }
      }
    }, cleanupInterval).unref();
  }

  public check(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.ipCache.get(ip);

    if (!record || now > record.resetTime) {
      this.ipCache.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { success: true, limit: this.limit, remaining: this.limit - 1, reset: now + this.windowMs };
    }

    if (record.count >= this.limit) {
      return { success: false, limit: this.limit, remaining: 0, reset: record.resetTime };
    }

    record.count += 1;
    this.ipCache.set(ip, record);

    return { 
      success: true, 
      limit: this.limit, 
      remaining: this.limit - record.count, 
      reset: record.resetTime 
    };
  }
}

export const contactRateLimiter = new RateLimiter(3, 60 * 60 * 1000);
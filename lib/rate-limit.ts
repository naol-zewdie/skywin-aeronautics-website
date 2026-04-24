export class RateLimiter {
  private ipCache = new Map<string, { count: number; resetTime: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 3, windowMs: number = 3600000) {
    this.limit = limit; // max requests
    this.windowMs = windowMs; // timeframe in milliseconds (default 1 hour)
  }

  public check(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
    const now = Date.now();
    const record = this.ipCache.get(ip);

    // If no record exists, or the time window has passed, reset the counter
    if (!record || now > record.resetTime) {
      this.ipCache.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return { success: true, limit: this.limit, remaining: this.limit - 1, reset: now + this.windowMs };
    }

    // If limit exceeded
    if (record.count >= this.limit) {
      return { success: false, limit: this.limit, remaining: 0, reset: record.resetTime };
    }

    // Increment counter
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

// Export a singleton instance for the contact route (3 requests per hour)
export const contactRateLimiter = new RateLimiter(3, 60 * 60 * 1000);

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil?: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  // In-memory store for rate limiting (use Redis in production)
  private readonly attempts = new Map<string, RateLimitEntry>();

  // Configuration
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes lockout after max attempts

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const key = `login:${ip}`;

    const now = Date.now();
    const entry = this.attempts.get(key);

    // Check if currently locked out
    if (entry?.lockedUntil && now < entry.lockedUntil) {
      const minutesRemaining = Math.ceil((entry.lockedUntil - now) / 60000);
      throw new HttpException(
        `Too many login attempts. Please try again in ${minutesRemaining} minutes.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Clean up expired entries periodically
    this.cleanup();

    return true;
  }

  recordFailedAttempt(request: Request): void {
    const ip = this.getClientIp(request);
    const key = `login:${ip}`;
    const now = Date.now();

    const entry = this.attempts.get(key);

    if (!entry || now - entry.firstAttempt > this.WINDOW_MS) {
      // First attempt or window expired
      this.attempts.set(key, {
        attempts: 1,
        firstAttempt: now,
      });
    } else {
      entry.attempts++;

      if (entry.attempts >= this.MAX_ATTEMPTS) {
        entry.lockedUntil = now + this.LOCKOUT_MS;
      }
    }
  }

  resetAttempts(request: Request): void {
    const ip = this.getClientIp(request);
    const key = `login:${ip}`;
    this.attempts.delete(key);
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
    }
    return request.ip || request.socket?.remoteAddress || 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (entry.lockedUntil && now > entry.lockedUntil) {
        this.attempts.delete(key);
      } else if (!entry.lockedUntil && now - entry.firstAttempt > this.WINDOW_MS) {
        this.attempts.delete(key);
      }
    }
  }
}

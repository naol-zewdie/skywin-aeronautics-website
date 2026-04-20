"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = void 0;
const common_1 = require("@nestjs/common");
let RateLimitGuard = class RateLimitGuard {
    attempts = new Map();
    MAX_ATTEMPTS = 5;
    WINDOW_MS = 15 * 60 * 1000;
    LOCKOUT_MS = 30 * 60 * 1000;
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = this.getClientIp(request);
        const key = `login:${ip}`;
        const now = Date.now();
        const entry = this.attempts.get(key);
        if (entry?.lockedUntil && now < entry.lockedUntil) {
            const minutesRemaining = Math.ceil((entry.lockedUntil - now) / 60000);
            throw new common_1.HttpException(`Too many login attempts. Please try again in ${minutesRemaining} minutes.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        this.cleanup();
        return true;
    }
    recordFailedAttempt(request) {
        const ip = this.getClientIp(request);
        const key = `login:${ip}`;
        const now = Date.now();
        const entry = this.attempts.get(key);
        if (!entry || now - entry.firstAttempt > this.WINDOW_MS) {
            this.attempts.set(key, {
                attempts: 1,
                firstAttempt: now,
            });
        }
        else {
            entry.attempts++;
            if (entry.attempts >= this.MAX_ATTEMPTS) {
                entry.lockedUntil = now + this.LOCKOUT_MS;
            }
        }
    }
    resetAttempts(request) {
        const ip = this.getClientIp(request);
        const key = `login:${ip}`;
        this.attempts.delete(key);
    }
    getClientIp(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim();
        }
        return request.ip || request.socket?.remoteAddress || 'unknown';
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.attempts.entries()) {
            if (entry.lockedUntil && now > entry.lockedUntil) {
                this.attempts.delete(key);
            }
            else if (!entry.lockedUntil && now - entry.firstAttempt > this.WINDOW_MS) {
                this.attempts.delete(key);
            }
        }
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)()
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map
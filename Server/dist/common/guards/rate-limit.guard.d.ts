import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
export declare class RateLimitGuard implements CanActivate {
    private readonly attempts;
    private readonly MAX_ATTEMPTS;
    private readonly WINDOW_MS;
    private readonly LOCKOUT_MS;
    canActivate(context: ExecutionContext): boolean;
    recordFailedAttempt(request: Request): void;
    resetAttempts(request: Request): void;
    private getClientIp;
    private cleanup;
}

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!MUTATING_METHODS.includes(request.method)) {
      return true;
    }


    const csrfCookie = request.cookies?.['csrf-token'] as string | undefined;
    const csrfHeader = request.headers['x-csrf-token'] as string | undefined;

    if (!csrfCookie || !csrfHeader || csrfCookie.length !== csrfHeader.length ||
        !crypto.timingSafeEqual(Buffer.from(csrfCookie), Buffer.from(csrfHeader))) {
      throw new ForbiddenException('CSRF validation failed');
    }

    return true;
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

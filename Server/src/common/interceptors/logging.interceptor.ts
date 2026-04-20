import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const userAgent = request.get('user-agent') || 'unknown';
    const userId = (request as { user?: { userId?: string } }).user?.userId || 'anonymous';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} - ${responseTime}ms - User: ${userId} - UA: ${userAgent}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${url} ${statusCode} - ${responseTime}ms - User: ${userId} - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}

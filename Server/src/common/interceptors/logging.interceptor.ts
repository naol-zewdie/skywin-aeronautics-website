import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Request } from "express";

// Sanitize user-controlled strings for safe logging (strip control characters)
function sanitize(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/[\r\n\x00-\x1f\x7f]/g, "_");
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const userAgent = sanitize(request.get("user-agent") || "unknown");
    const userId =
      (request as { user?: { userId?: string } }).user?.userId || "anonymous";
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - now;

          this.logger.log(
            `${method} ${sanitize(url)} ${statusCode} - ${responseTime}ms - User: ${userId} - UA: ${userAgent}`,
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${sanitize(url)} ${statusCode} - ${responseTime}ms - User: ${userId} - Error: ${sanitize(error.message || "unknown")}`,
          );
        },
      }),
    );
  }
}

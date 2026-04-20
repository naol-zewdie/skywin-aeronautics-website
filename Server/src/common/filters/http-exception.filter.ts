import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Build standardized error response
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: this.getErrorMessage(exceptionResponse, status),
      error: this.getErrorType(status),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add validation details if available (for 400 errors)
    if (status === HttpStatus.BAD_REQUEST && typeof exceptionResponse === 'object') {
      const validationDetails = (exceptionResponse as { message?: string | string[] }).message;
      if (Array.isArray(validationDetails)) {
        errorResponse.details = { validationErrors: validationDetails };
      }
    }

    // Log error (without sensitive data)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorResponse.message}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exceptionResponse: string | object, status: number): string {
    // Security: Don't expose internal error details for 500 errors
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return 'An unexpected error occurred. Please try again later.';
    }

    // Security: Sanitize auth error messages to prevent user enumeration
    if (status === HttpStatus.UNAUTHORIZED) {
      return 'Authentication failed. Please check your credentials and try again.';
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const message = (exceptionResponse as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join(', ') : message;
    }

    return HttpStatus[status] || 'Error';
  }

  private getErrorType(status: number): string {
    const errorTypes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BadRequest',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'NotFound',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'ValidationError',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RateLimitExceeded',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerError',
    };

    return errorTypes[status] || 'UnknownError';
  }
}

// Catch-all filter for non-HTTP exceptions
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      error: 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `Unhandled Exception: ${exception.message}`,
      exception.stack,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}

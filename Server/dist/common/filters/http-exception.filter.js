"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1, AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        const errorResponse = {
            statusCode: status,
            message: this.getErrorMessage(exceptionResponse, status),
            error: this.getErrorType(status),
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (status === common_1.HttpStatus.BAD_REQUEST && typeof exceptionResponse === 'object') {
            const validationDetails = exceptionResponse.message;
            if (Array.isArray(validationDetails)) {
                errorResponse.details = { validationErrors: validationDetails };
            }
        }
        this.logger.error(`${request.method} ${request.url} - ${status} - ${errorResponse.message}`, exception.stack);
        response.status(status).json(errorResponse);
    }
    getErrorMessage(exceptionResponse, status) {
        if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
            return 'An unexpected error occurred. Please try again later.';
        }
        if (status === common_1.HttpStatus.UNAUTHORIZED) {
            return 'Authentication failed. Please check your credentials and try again.';
        }
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }
        if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
            const message = exceptionResponse.message;
            return Array.isArray(message) ? message.join(', ') : message;
        }
        return common_1.HttpStatus[status] || 'Error';
    }
    getErrorType(status) {
        const errorTypes = {
            [common_1.HttpStatus.BAD_REQUEST]: 'BadRequest',
            [common_1.HttpStatus.UNAUTHORIZED]: 'Unauthorized',
            [common_1.HttpStatus.FORBIDDEN]: 'Forbidden',
            [common_1.HttpStatus.NOT_FOUND]: 'NotFound',
            [common_1.HttpStatus.CONFLICT]: 'Conflict',
            [common_1.HttpStatus.UNPROCESSABLE_ENTITY]: 'ValidationError',
            [common_1.HttpStatus.TOO_MANY_REQUESTS]: 'RateLimitExceeded',
            [common_1.HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerError',
        };
        return errorTypes[status] || 'UnknownError';
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const errorResponse = {
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected error occurred. Please try again later.',
            error: 'InternalServerError',
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=http-exception.filter.js.map
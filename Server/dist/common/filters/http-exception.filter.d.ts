import { ExceptionFilter, ArgumentsHost, HttpException } from '@nestjs/common';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: HttpException, host: ArgumentsHost): void;
    private getErrorMessage;
    private getErrorType;
}
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: Error, host: ArgumentsHost): void;
}

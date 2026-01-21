import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let statusCode = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // If already formatted with our structure, use it
        if (responseObj.status === 'error') {
          this.logger.warn(`HTTP Exception [${status}]: ${message} - ${request.method} ${request.url}`);
          return response.status(status).json(responseObj);
        }
        
        // Otherwise format it
        message = responseObj.message || exception.message;
        statusCode = status;
        this.logger.warn(`HTTP Exception [${status}]: ${message} - ${request.method} ${request.url}`);
      } else {
        message = exceptionResponse as string;
        statusCode = status;
        this.logger.warn(`HTTP Exception [${status}]: ${message} - ${request.method} ${request.url}`);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      this.logger.error(`Unhandled Error: ${message} - ${request.method} ${request.url}`, exception.stack);
    } else {
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)} - ${request.method} ${request.url}`);
    }

    // Determine if it's a business error (400-499) or server error (500+)
    const isBusinessError = status >= 400 && status < 500;

    const errorResponse: ApiResponse = {
      status: 'error',
      message,
      statusCode,
      error: process.env.NODE_ENV === 'development' ? (exception as Error)?.stack : undefined,
    };

    response.status(status).json(errorResponse);
  }
}

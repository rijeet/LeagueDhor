import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Send dates as-is (UTC from database) - frontend will convert to user's local timezone
        return {
          status: 'success',
          message: this.getMessage(context),
          statusCode: context.switchToHttp().getResponse().statusCode || 200,
          data,
        };
      }),
    );
  }

  private getMessage(context: ExecutionContext): string {
    const method = context.switchToHttp().getRequest().method;
    const path = context.switchToHttp().getRequest().route?.path;

    // Custom messages for specific endpoints
    if (path === '/health') {
      return 'Service is healthy';
    }

    // Default messages based on HTTP method
    const messages: Record<string, string> = {
      GET: 'Data retrieved successfully',
      POST: 'Operation completed successfully',
      PUT: 'Resource updated successfully',
      PATCH: 'Resource updated successfully',
      DELETE: 'Resource deleted successfully',
    };

    return messages[method] || 'Operation completed successfully';
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url, headers } = request;
    const requestId = headers['x-request-id'] as string;
    const userAgent = headers['user-agent'] as string;

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<Response>();
          const delay = Date.now() - now;

          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} ${delay}ms - ${userAgent}`,
          );
        },
        error: (error: Error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error?.['status'] || 500} ${delay}ms - ${userAgent}`,
            error.stack,
          );
        },
      }),
    );
  }
}

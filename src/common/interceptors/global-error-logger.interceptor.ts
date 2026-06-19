import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class GlobalErrorLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GlobalErrorLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const method = request.method;
        const url = request.url;
        const ip = request.ip;
        const userAgent = request.headers['user-agent'] || 'unknown';

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = error.message || 'Internal server error';

        if (error instanceof HttpException) {
          status = error.getStatus();
          const responseBody = error.getResponse();
          message = typeof responseBody === 'object'
            ? JSON.stringify(responseBody)
            : responseBody;
        }

        this.logger.error(
          `Error in [${method}] ${url} | IP: ${ip} | User-Agent: ${userAgent} | Status: ${status} | Message: ${message}`,
          error.stack,
        );

        return throwError(() => error);
      }),
    );
  }
}

import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by username if provided in body (e.g. login credentials), fallback to IP
    if (req.body && req.body.username) {
      return `login_limit_${req.body.username}`;
    }
    return req.ip;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    throw new ThrottlerException(
      'Too many login attempts. Please try again after 1 minute.',
    );
  }
}

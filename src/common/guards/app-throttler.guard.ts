import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

/**
 * Skips rate limiting when X-Throttle-Bypass matches CRON_SECRET (live test suites / CI).
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<{ headers?: Record<string, string> }>();
    const secret = process.env.CRON_SECRET;
    const bypass = req.headers?.["x-throttle-bypass"];
    if (secret && bypass && bypass === secret) {
      return true;
    }
    return super.shouldSkip(context);
  }
}

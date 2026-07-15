import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Protects HTTP endpoints that mirror scheduler/cron jobs.
 * Requires header `X-Cron-Secret` to match env `CRON_SECRET`.
 * If CRON_SECRET is unset, the endpoint stays locked closed.
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('CRON_SECRET')?.trim();
    if (!secret) {
      throw new ForbiddenException(
        'Cron HTTP trigger is disabled. Set CRON_SECRET to enable it, or rely on the in-process scheduler.',
      );
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const header = request.headers['x-cron-secret'];
    const provided = Array.isArray(header) ? header[0] : header;

    if (!provided || provided !== secret) {
      throw new UnauthorizedException('Invalid or missing X-Cron-Secret.');
    }

    return true;
  }
}

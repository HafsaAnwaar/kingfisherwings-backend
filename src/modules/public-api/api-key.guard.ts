import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantApiKeysService } from './public-api.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeys: TenantApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers['x-api-key'] as string | undefined;
    if (!header) throw new UnauthorizedException('X-API-Key header required.');

    const key = await this.apiKeys.validateApiKey(header);
    if (!key) throw new UnauthorizedException('Invalid API key.');

    req.tenantId = key.tenant_id;
    req.apiKeyScopes = key.scopes;
    return true;
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const API_SCOPE_KEY = 'api_scope';
export const RequireApiScope = (...scopes: string[]) => SetMetadata(API_SCOPE_KEY, scopes);

@Injectable()
export class ApiKeyScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(API_SCOPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest<{ apiKeyScopes?: string[] }>();
    const granted = req.apiKeyScopes ?? [];
    if (!granted.length) return true;
    const ok = required.some((s) => granted.includes(s) || granted.includes('*'));
    if (!ok) {
      throw new ForbiddenException(`API key missing required scope: ${required.join(' or ')}`);
    }
    return true;
  }
}

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('JwtSecrets');

export function validatePortalVendorJwtSecrets(config: ConfigService): void {
  const portalAccess = config.get<string>('PORTAL_JWT_ACCESS_SECRET')?.trim();
  const portalRefresh = config.get<string>('PORTAL_JWT_REFRESH_SECRET')?.trim();
  const vendorAccess = config.get<string>('VENDOR_JWT_ACCESS_SECRET')?.trim();
  const vendorRefresh = config.get<string>('VENDOR_JWT_REFRESH_SECRET')?.trim();
  const staffAccess = config.get<string>('JWT_ACCESS_SECRET')?.trim();

  // Opt-in strict check for deployed environments (set JWT_SECRETS_STRICT=true on Render).
  const strict = config.get<string>('JWT_SECRETS_STRICT') === 'true';

  if (strict) {
    const missing: string[] = [];
    if (!portalAccess) missing.push('PORTAL_JWT_ACCESS_SECRET');
    if (!portalRefresh) missing.push('PORTAL_JWT_REFRESH_SECRET');
    if (!vendorAccess) missing.push('VENDOR_JWT_ACCESS_SECRET');
    if (!vendorRefresh) missing.push('VENDOR_JWT_REFRESH_SECRET');
    if (missing.length) {
      throw new Error(
        `JWT_SECRETS_STRICT=true requires distinct portal/vendor JWT secrets. Missing: ${missing.join(', ')}`,
      );
    }
    if (
      staffAccess &&
      (portalAccess === staffAccess ||
        vendorAccess === staffAccess ||
        portalRefresh === config.get<string>('JWT_REFRESH_SECRET')?.trim())
    ) {
      throw new Error(
        'JWT_SECRETS_STRICT=true: portal/vendor JWT secrets must differ from staff JWT_ACCESS_SECRET / JWT_REFRESH_SECRET.',
      );
    }
    return;
  }

  if (!portalAccess || !portalRefresh || !vendorAccess || !vendorRefresh) {
    logger.warn(
      'PORTAL_/VENDOR_ JWT secrets unset — falling back to JWT_ACCESS_SECRET / JWT_REFRESH_SECRET. ' +
        'Set distinct secrets and JWT_SECRETS_STRICT=true before production go-live.',
    );
  } else if (staffAccess && (portalAccess === staffAccess || vendorAccess === staffAccess)) {
    logger.warn(
      'Portal/vendor JWT secrets match staff JWT secret — use distinct values when JWT_SECRETS_STRICT=true.',
    );
  }
}

export function resolvePortalAccessSecret(config: ConfigService): string {
  const secret =
    config.get<string>('PORTAL_JWT_ACCESS_SECRET')?.trim() ??
    config.get<string>('JWT_ACCESS_SECRET')?.trim();
  if (!secret) {
    throw new Error('PORTAL_JWT_ACCESS_SECRET or JWT_ACCESS_SECRET must be configured.');
  }
  return secret;
}

export function resolvePortalRefreshSecret(config: ConfigService): string {
  const secret =
    config.get<string>('PORTAL_JWT_REFRESH_SECRET')?.trim() ??
    config.get<string>('JWT_REFRESH_SECRET')?.trim();
  if (!secret) {
    throw new Error('PORTAL_JWT_REFRESH_SECRET or JWT_REFRESH_SECRET must be configured.');
  }
  return secret;
}

export function resolveVendorAccessSecret(config: ConfigService): string {
  const secret =
    config.get<string>('VENDOR_JWT_ACCESS_SECRET')?.trim() ??
    config.get<string>('JWT_ACCESS_SECRET')?.trim();
  if (!secret) {
    throw new Error('VENDOR_JWT_ACCESS_SECRET or JWT_ACCESS_SECRET must be configured.');
  }
  return secret;
}

export function resolveVendorRefreshSecret(config: ConfigService): string {
  const secret =
    config.get<string>('VENDOR_JWT_REFRESH_SECRET')?.trim() ??
    config.get<string>('JWT_REFRESH_SECRET')?.trim();
  if (!secret) {
    throw new Error('VENDOR_JWT_REFRESH_SECRET or JWT_REFRESH_SECRET must be configured.');
  }
  return secret;
}

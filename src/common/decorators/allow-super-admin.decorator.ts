import { SetMetadata } from '@nestjs/common';

export const ALLOW_SUPER_ADMIN_KEY = 'allowSuperAdmin';

/**
 * Allows a platform SuperAdmin principal on an otherwise tenant-scoped
 * route (e.g. /tenants, /auth/me, POST /users with body.tenant_id).
 */
export const AllowSuperAdmin = () => SetMetadata(ALLOW_SUPER_ADMIN_KEY, true);

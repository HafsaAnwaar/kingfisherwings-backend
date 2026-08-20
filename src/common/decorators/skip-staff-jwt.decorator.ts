import { SetMetadata } from '@nestjs/common';

export const SKIP_STAFF_JWT_KEY = 'skipStaffJwt';

/**
 * Skips the global staff JwtAuthGuard so portal/vendor guards can
 * authenticate their own JWT principal. Unlike @Public(), routes stay
 * protected by PortalAuthGuard or VendorAuthGuard — anonymous access is
 * not allowed if those guards are present.
 */
export const SkipStaffJwt = () => SetMetadata(SKIP_STAFF_JWT_KEY, true);

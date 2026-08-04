/**
 * Portal JWT claims — isolated from staff / super-admin tokens.
 * Staff JwtStrategy rejects principal === 'portal'.
 */
export interface PortalJwtPayload {
  principal: 'portal';
  sub: string;
  tenantId: string;
  partyId: string;
  email: string;
  /** = PortalSession.jti */
  sessionId: string;
  type: 'access' | 'refresh';
}

/** Populated on request after PortalAuthGuard. */
export interface CurrentPortalUser {
  id: string;
  tenantId: string;
  partyId: string;
  email: string;
  fullName: string;
  sessionId: string;
}

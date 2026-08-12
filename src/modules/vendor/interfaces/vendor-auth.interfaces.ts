export interface VendorJwtPayload {
  principal: 'vendor';
  sub: string;
  tenantId: string;
  partyId: string;
  email: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface CurrentVendorUser {
  id: string;
  tenantId: string;
  partyId: string;
  email: string;
  fullName: string;
  sessionId: string;
}

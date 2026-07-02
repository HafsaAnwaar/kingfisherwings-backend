// src/modules/auth/interfaces/jwt-payload.interface.ts

import { UserRole } from '@prisma/client';

export interface JwtPayload {

  sub: string; // user id

  tenant_id: string;

  email: string;

  role: UserRole;

  jti: string; // matches Session.jti

  type: 'access' | 'refresh';

}
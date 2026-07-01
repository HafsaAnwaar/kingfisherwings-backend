// src/modules/auth/interfaces/request-with-user.interface.ts

import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {

  id: string;

  tenant_id: string;

  email: string;

  role: UserRole;

  jti: string;

}

export interface RequestWithUser extends Request {

  user: AuthenticatedUser;

}
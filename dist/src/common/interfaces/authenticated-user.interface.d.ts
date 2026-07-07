import { Request } from 'express';
import { UserRole } from '@prisma/client';
export interface AuthenticatedUser {
    id: string;
    tenantId: string;
    tenantSlug: string;
    isPlatformAdmin: boolean;
    branchId: string | null;
    roleIds: string[];
    role: UserRole;
    permissions: string[];
    email: string;
    jti: string;
    sessionId: string;
}
export interface AuthenticatedRequest extends Request {
    user: AuthenticatedUser;
}

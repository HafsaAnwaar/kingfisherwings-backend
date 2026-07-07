import { Request } from 'express';
import { UserRole } from '@prisma/client';
export interface CurrentUser {
    id: string;
    tenantId: string;
    branchId: string | null;
    roleId: string | null;
    role: UserRole;
    sessionId: string;
    email: string;
    permissions: string[];
}
export interface AuthenticatedRequest extends Request {
    user: CurrentUser;
}

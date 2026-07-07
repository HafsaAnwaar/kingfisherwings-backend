import { UserRole } from '@prisma/client';
export interface UserJwtPayload {
    principal: 'user';
    sub: string;
    tenantId: string;
    branchId: string | null;
    roleId: string | null;
    role: UserRole;
    sessionId: string;
    email: string;
    permissions: string[];
    type: 'access' | 'refresh';
}
export interface SuperAdminJwtPayload {
    principal: 'super_admin';
    sub: string;
    email: string;
    sessionId: string;
    type: 'access' | 'refresh';
}
export type JwtPayload = UserJwtPayload | SuperAdminJwtPayload;

import { UserRole, UserStatus } from '@prisma/client';
export declare class QueryUserDto {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
    sortBy: string;
    order: 'asc' | 'desc';
    branch_id?: string;
    department_id?: string;
}

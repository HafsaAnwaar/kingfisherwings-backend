import { UserRole, UserStatus } from '@prisma/client';
export declare class UserSummaryResponse {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar_url?: string;
    branch_id?: string;
}

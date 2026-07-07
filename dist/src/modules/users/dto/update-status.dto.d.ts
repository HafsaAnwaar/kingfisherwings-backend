import { UserStatus } from '@prisma/client';
export declare class UpdateStatusDto {
    status: UserStatus;
    reason?: string;
}

import { PartyCreditStatus } from '@prisma/client';
export declare class UpdateCreditStatusDto {
    credit_status: PartyCreditStatus;
    reason?: string;
}

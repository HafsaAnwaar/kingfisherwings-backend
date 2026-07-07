import { PartyType, PartyCreditStatus } from '@prisma/client';
export declare class PartyQueryDto {
    page: number;
    limit: number;
    search?: string;
    party_type?: PartyType;
    credit_status?: PartyCreditStatus;
    order: 'asc' | 'desc';
}

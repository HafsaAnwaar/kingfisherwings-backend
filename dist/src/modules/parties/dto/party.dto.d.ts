import { PartyType } from '@prisma/client';
export declare class CreatePartyDto {
    party_type: PartyType;
    code: string;
    name: string;
    short_name?: string;
    vat_number?: string;
    cr_number?: string;
    country_code?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    credit_limit?: number;
    credit_days?: number;
    currency_code?: string;
    salesperson_id?: string;
    portal_access?: boolean;
    marketing_subscription?: boolean;
    iata_code?: string;
    scac_code?: string;
    tags?: string[];
    notes?: string;
    is_active?: boolean;
}
declare const UpdatePartyDto_base: import("@nestjs/common").Type<Partial<CreatePartyDto>>;
export declare class UpdatePartyDto extends UpdatePartyDto_base {
}
export {};

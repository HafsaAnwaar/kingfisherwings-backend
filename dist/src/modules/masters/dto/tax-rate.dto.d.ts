import { TaxType } from '@prisma/client';
export declare class CreateTaxRateDto {
    name: string;
    code: string;
    tax_type?: TaxType;
    rate: number;
    country_code: string;
    effective_from: string;
    effective_to?: string;
    is_default?: boolean;
    is_active?: boolean;
}
declare const UpdateTaxRateDto_base: import("@nestjs/common").Type<Partial<CreateTaxRateDto>>;
export declare class UpdateTaxRateDto extends UpdateTaxRateDto_base {
}
export {};

import { ChargeGroup } from '@prisma/client';
export declare class CreateChargeCodeDto {
    code: string;
    description: string;
    charge_group?: ChargeGroup;
    applicable_modes: string[];
    tax_applicable?: boolean;
    tax_rate_id?: string;
    gl_revenue_code?: string;
    gl_cost_code?: string;
    unit?: string;
    is_mandatory?: boolean;
    is_active?: boolean;
}
declare const UpdateChargeCodeDto_base: import("@nestjs/common").Type<Partial<CreateChargeCodeDto>>;
export declare class UpdateChargeCodeDto extends UpdateChargeCodeDto_base {
}
export {};

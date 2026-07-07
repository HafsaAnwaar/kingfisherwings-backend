export declare class CreateWarehouseDto {
    name: string;
    code: string;
    address?: string;
    city?: string;
    country_code?: string;
    capacity_sqm?: number;
    is_active?: boolean;
}
declare const UpdateWarehouseDto_base: import("@nestjs/common").Type<Partial<CreateWarehouseDto>>;
export declare class UpdateWarehouseDto extends UpdateWarehouseDto_base {
}
export {};

export declare class CreateVesselDto {
    name: string;
    imo_number?: string;
    flag_country?: string;
    shipping_line_id?: string;
    vessel_type?: string;
    year_built?: number;
    gross_tonnage?: number;
    is_active?: boolean;
}
declare const UpdateVesselDto_base: import("@nestjs/common").Type<Partial<CreateVesselDto>>;
export declare class UpdateVesselDto extends UpdateVesselDto_base {
}
export {};

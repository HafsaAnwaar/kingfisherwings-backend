export declare class CreateCountryDto {
    iso_code: string;
    iso3_code: string;
    name: string;
    dial_code?: string;
    region?: string;
    is_active?: boolean;
}
declare const UpdateCountryDto_base: import("@nestjs/common").Type<Partial<CreateCountryDto>>;
export declare class UpdateCountryDto extends UpdateCountryDto_base {
}
export {};

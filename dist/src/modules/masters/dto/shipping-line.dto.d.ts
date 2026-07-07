export declare class CreateShippingLineDto {
    scac_code: string;
    name: string;
    short_name?: string;
    country_code?: string;
    website?: string;
    tracking_url?: string;
    is_active?: boolean;
}
declare const UpdateShippingLineDto_base: import("@nestjs/common").Type<Partial<CreateShippingLineDto>>;
export declare class UpdateShippingLineDto extends UpdateShippingLineDto_base {
}
export {};

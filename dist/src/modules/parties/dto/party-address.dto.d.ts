export declare class CreatePartyAddressDto {
    label: string;
    address_line1: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country_code: string;
    is_default?: boolean;
}
declare const UpdatePartyAddressDto_base: import("@nestjs/common").Type<Partial<CreatePartyAddressDto>>;
export declare class UpdatePartyAddressDto extends UpdatePartyAddressDto_base {
}
export {};

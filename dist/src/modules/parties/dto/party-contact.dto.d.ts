export declare class CreatePartyContactDto {
    name: string;
    designation?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    is_primary?: boolean;
}
declare const UpdatePartyContactDto_base: import("@nestjs/common").Type<Partial<CreatePartyContactDto>>;
export declare class UpdatePartyContactDto extends UpdatePartyContactDto_base {
}
export {};

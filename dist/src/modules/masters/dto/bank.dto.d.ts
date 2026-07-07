export declare class CreateBankDto {
    name: string;
    short_name?: string;
    swift_code?: string;
    iban_prefix?: string;
    country_code?: string;
    is_active?: boolean;
}
declare const UpdateBankDto_base: import("@nestjs/common").Type<Partial<CreateBankDto>>;
export declare class UpdateBankDto extends UpdateBankDto_base {
}
export {};

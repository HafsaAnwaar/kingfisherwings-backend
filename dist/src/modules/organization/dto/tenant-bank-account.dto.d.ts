export declare class CreateTenantBankAccountDto {
    bank_name: string;
    account_name: string;
    account_number: string;
    iban?: string;
    swift_code?: string;
    currency_code?: string;
    branch_id?: string;
    is_default?: boolean;
    is_active?: boolean;
}
declare const UpdateTenantBankAccountDto_base: import("@nestjs/common").Type<Partial<CreateTenantBankAccountDto>>;
export declare class UpdateTenantBankAccountDto extends UpdateTenantBankAccountDto_base {
}
export {};

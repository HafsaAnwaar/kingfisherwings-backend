export declare class CreateCurrencyDto {
    code: string;
    name: string;
    symbol: string;
    decimal_places?: number;
    is_base?: boolean;
    is_active?: boolean;
}
declare const UpdateCurrencyDto_base: import("@nestjs/common").Type<Partial<CreateCurrencyDto>>;
export declare class UpdateCurrencyDto extends UpdateCurrencyDto_base {
}
export {};

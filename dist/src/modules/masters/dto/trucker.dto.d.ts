export declare class CreateTruckerDto {
    name: string;
    code: string;
    country_code?: string;
    phone?: string;
    email?: string;
    contact_person?: string;
    is_active?: boolean;
}
declare const UpdateTruckerDto_base: import("@nestjs/common").Type<Partial<CreateTruckerDto>>;
export declare class UpdateTruckerDto extends UpdateTruckerDto_base {
}
export {};

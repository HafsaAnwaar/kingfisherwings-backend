export declare class CreateBranchDto {
    name: string;
    code: string;
    address?: string;
    city?: string;
    country_code?: string;
    phone?: string;
    email?: string;
    is_head_office?: boolean;
    is_active?: boolean;
}
declare const UpdateBranchDto_base: import("@nestjs/common").Type<Partial<CreateBranchDto>>;
export declare class UpdateBranchDto extends UpdateBranchDto_base {
}
export {};

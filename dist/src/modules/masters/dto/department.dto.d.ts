export declare class CreateDepartmentDto {
    name: string;
    code: string;
    parent_id?: string;
    is_active?: boolean;
}
declare const UpdateDepartmentDto_base: import("@nestjs/common").Type<Partial<CreateDepartmentDto>>;
export declare class UpdateDepartmentDto extends UpdateDepartmentDto_base {
}
export {};

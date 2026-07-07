export declare class CreateDesignationDto {
    name: string;
    department_id?: string;
    is_active?: boolean;
}
declare const UpdateDesignationDto_base: import("@nestjs/common").Type<Partial<CreateDesignationDto>>;
export declare class UpdateDesignationDto extends UpdateDesignationDto_base {
}
export {};

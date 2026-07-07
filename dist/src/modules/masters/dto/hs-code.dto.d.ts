export declare class CreateHsCodeDto {
    hs_code: string;
    description: string;
    import_duty_rate?: number;
    export_duty_rate?: number;
    dg_class?: string;
    un_number?: string;
    is_prohibited?: boolean;
    is_restricted?: boolean;
    notes?: string;
    is_active?: boolean;
}
declare const UpdateHsCodeDto_base: import("@nestjs/common").Type<Partial<CreateHsCodeDto>>;
export declare class UpdateHsCodeDto extends UpdateHsCodeDto_base {
}
export {};

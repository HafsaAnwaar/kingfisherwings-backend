export declare class CreateUnitOfMeasureDto {
    code: string;
    name: string;
    category: string;
    is_active?: boolean;
}
declare const UpdateUnitOfMeasureDto_base: import("@nestjs/common").Type<Partial<CreateUnitOfMeasureDto>>;
export declare class UpdateUnitOfMeasureDto extends UpdateUnitOfMeasureDto_base {
}
export {};

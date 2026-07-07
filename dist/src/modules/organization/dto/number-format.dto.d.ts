import { DocumentNumberType, DocumentNumberResetFrequency } from '@prisma/client';
export declare class CreateNumberFormatDto {
    document_type: DocumentNumberType;
    prefix: string;
    include_branch_code?: boolean;
    include_year?: boolean;
    year_digits?: number;
    include_month?: boolean;
    sequence_length?: number;
    separator?: string;
    reset_frequency?: DocumentNumberResetFrequency;
    is_active?: boolean;
}
declare const UpdateNumberFormatDto_base: import("@nestjs/common").Type<Partial<CreateNumberFormatDto>>;
export declare class UpdateNumberFormatDto extends UpdateNumberFormatDto_base {
}
export {};

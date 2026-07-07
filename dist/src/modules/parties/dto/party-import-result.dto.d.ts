export declare class ImportRowError {
    row: number;
    code?: string;
    message: string;
}
export declare class PartyImportResultDto {
    total: number;
    imported: number;
    failed: number;
    createdIds: string[];
    errors: ImportRowError[];
}

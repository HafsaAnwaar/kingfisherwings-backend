export declare class MasterQueryDto {
    page: number;
    limit: number;
    search?: string;
    is_active?: boolean;
    order: 'asc' | 'desc';
}

export declare class TenantQueryDto {
    page: number;
    limit: number;
    search?: string;
    sortBy: string;
    order: 'asc' | 'desc';
}

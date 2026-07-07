export interface PaginationQuery {
    page: number;
    limit: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginationResult<T> {
    data: T[];
    meta: PaginationMeta;
}

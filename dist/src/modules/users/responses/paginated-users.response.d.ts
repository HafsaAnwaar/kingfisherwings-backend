import { UserResponse } from './user.response';
export declare class PaginationMetaResponse {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare class PaginatedUsersResponse {
    data: UserResponse[];
    meta: PaginationMetaResponse;
}

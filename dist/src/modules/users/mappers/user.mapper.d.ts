import { User } from '@prisma/client';
import { UserEntity } from '../entities/user.entity';
import { UserResponse } from '../responses/user.response';
import { UserSummaryResponse } from '../responses/user-summary.response';
import { PaginatedUsersResponse } from '../responses/paginated-users.response';
export declare class UserMapper {
    static toEntity(user: User): UserEntity;
    static toEntities(users: User[]): UserEntity[];
    static toResponse(user: User): UserResponse;
    static toResponses(users: User[]): UserResponse[];
    static toSummary(user: User): UserSummaryResponse;
    static toSummaries(users: User[]): UserSummaryResponse[];
    static toPaginated(result: {
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }): PaginatedUsersResponse;
}

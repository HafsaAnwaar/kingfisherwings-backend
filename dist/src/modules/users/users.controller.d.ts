import { UsersService } from './users.service';
import { CurrentUser as CurrentUserType } from './interfaces/current-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUserDto } from './dto/bulk-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { UserResponse } from './responses/user.response';
import { PaginatedUsersResponse } from './responses/paginated-users.response';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(tenantId: string, query: QueryUserDto): Promise<PaginatedUsersResponse>;
    findOne(tenantId: string, id: string): Promise<UserResponse>;
    create(principal: unknown, dto: CreateUserDto): Promise<{
        user: UserResponse;
        temporaryPassword: string;
    }>;
    update(tenantId: string, actorId: string, id: string, dto: UpdateUserDto): Promise<UserResponse>;
    updateStatus(tenantId: string, actorId: string, id: string, dto: UpdateStatusDto): Promise<UserResponse>;
    bulkAction(tenantId: string, actorId: string, dto: BulkUserDto): Promise<import("./users.types").BulkActionResult>;
    remove(tenantId: string, actorId: string, id: string): Promise<void>;
    restore(tenantId: string, actorId: string, id: string): Promise<UserResponse>;
    changeOwnPassword(currentUser: CurrentUserType, dto: ChangePasswordDto): Promise<void>;
    adminResetPassword(tenantId: string, actorId: string, id: string, dto: AdminResetPasswordDto): Promise<import("./users.types").AdminResetPasswordResult>;
    forceLogout(tenantId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

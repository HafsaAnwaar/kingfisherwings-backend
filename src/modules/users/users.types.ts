import { User } from '@prisma/client';
import { PaginationQuery } from './interfaces/pagination.interface';

export interface UserSearchFilters extends PaginationQuery {
  search?: string;
  role?: string;
  status?: string;
  branchId?: string;
  departmentId?: string;
}

export interface CreateUserResponse {
  user: User;
  temporaryPassword: string;
}

export interface AdminResetPasswordResult {
  temporaryPassword: string;
}

export interface BulkActionResult {
  requested: number;
  affected: number;
}

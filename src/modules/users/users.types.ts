import { User } from '@prisma/client';

export interface PaginationResult<T> {
  data: T[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

export interface CreateUserResponse {
  user: User;

  temporaryPassword: string;
}

export interface UserSearchFilters {
  search?: string;

  role?: string;

  status?: string;

  branchId?: string;

  departmentId?: string;

  page: number;

  limit: number;
}
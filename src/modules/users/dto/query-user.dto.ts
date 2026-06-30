import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { Transform } from 'class-transformer';

import {
  UserRole,
  UserStatus,
} from '@prisma/client';

export class QueryUserDto {

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  sortBy = 'created_at';

  @IsOptional()
  @IsString()
  order: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  branch_id?: string;

  @IsOptional()
  @IsString()
  department_id?: string;
}
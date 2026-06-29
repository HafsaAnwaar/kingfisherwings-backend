// src/modules/tenants/dto/tenant-query.dto.ts

import {
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class TenantQueryDto {

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy = 'created_at';

  @IsOptional()
  @IsString()
  order: 'asc' | 'desc' = 'desc';

}
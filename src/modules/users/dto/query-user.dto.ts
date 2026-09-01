import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";
import { UserRole, UserStatus } from "@prisma/client";
import { USERS_CONSTANTS } from "../constants/users.constants";

export class QueryUserDto {
  @ApiPropertyOptional({ default: USERS_CONSTANTS.DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = USERS_CONSTANTS.DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: USERS_CONSTANTS.DEFAULT_LIMIT,
    minimum: 1,
    maximum: USERS_CONSTANTS.MAX_LIMIT,
  })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(USERS_CONSTANTS.MAX_LIMIT)
  limit: number = USERS_CONSTANTS.DEFAULT_LIMIT;

  @ApiPropertyOptional({
    description: "Matches first name, last name, email, or phone.",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    enum: USERS_CONSTANTS.SORTABLE_FIELDS,
    default: USERS_CONSTANTS.DEFAULT_SORT,
  })
  @IsOptional()
  @IsIn(USERS_CONSTANTS.SORTABLE_FIELDS)
  sortBy: string = USERS_CONSTANTS.DEFAULT_SORT;

  @ApiPropertyOptional({
    enum: ["asc", "desc"],
    default: USERS_CONSTANTS.DEFAULT_ORDER,
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = USERS_CONSTANTS.DEFAULT_ORDER;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  department_id?: string;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PortalDisputeStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CreateVendorDisputeDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  invoice_id!: string;

  @ApiProperty({ example: "Incorrect amount" })
  @IsString()
  @Length(3, 200)
  reason!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;
}

export class VendorDisputeQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: PortalDisputeStatus })
  @IsOptional()
  @IsEnum(PortalDisputeStatus)
  status?: PortalDisputeStatus;
}

export class ReviewVendorDisputeDto {
  @ApiProperty({ enum: PortalDisputeStatus })
  @IsEnum(PortalDisputeStatus)
  status!: PortalDisputeStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  staff_notes?: string;
}

export class StaffVendorDisputeQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ enum: PortalDisputeStatus })
  @IsOptional()
  @IsEnum(PortalDisputeStatus)
  status?: PortalDisputeStatus;
}

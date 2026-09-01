import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DocumentationDoStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";
import { DocumentationPaginationDto } from "./documentation-pagination.dto";

export class UpdateDeliveryOrderDto {
  @ApiProperty()
  @IsString()
  @Length(1, 50)
  do_number!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  do_date?: string;

  @ApiPropertyOptional({ enum: DocumentationDoStatus })
  @IsOptional()
  @IsEnum(DocumentationDoStatus)
  do_status?: DocumentationDoStatus;
}

export class ClosedJobsQueryDto extends DocumentationPaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}

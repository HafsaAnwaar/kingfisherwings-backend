import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";
import { DocumentationPaginationDto } from "../../documentation/dto/documentation-pagination.dto";

export class OperationsDashboardQueryDto extends DocumentationPaginationDto {
  @ApiProperty()
  @IsDateString()
  from_date!: string;

  @ApiProperty()
  @IsDateString()
  to_date!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  branch_id?: string;
}

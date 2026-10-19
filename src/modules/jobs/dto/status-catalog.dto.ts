import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class CreateStatusCatalogDto {
  @ApiProperty({
    description: "Unique catalog code (letters, digits, underscore)",
    example: "CUSTOMS_HOLD",
  })
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: "code must be UPPER_SNAKE_CASE starting with a letter",
  })
  code!: string;

  @ApiProperty({ example: "Customs hold" })
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiProperty({
    description: "System status this custom status maps to for workflow gates",
    example: "ON_HOLD",
  })
  @IsString()
  @MaxLength(40)
  maps_to_system_status!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_terminal?: boolean;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class UpdateStatusCatalogDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  maps_to_system_status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_terminal?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ChangeStatusByCodeDto {
  @ApiProperty({
    description: "Catalog code (system or custom)",
    example: "CUSTOMS_HOLD",
  })
  @IsString()
  @MaxLength(40)
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

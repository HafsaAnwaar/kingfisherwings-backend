import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  Matches,
} from "class-validator";

export class CreateHsCodeDto {
  @ApiProperty({ example: "8517.12" })
  @IsString()
  @Matches(/^\d{4}(\.\d{2}){0,3}$/, {
    message: "hs_code must look like 8517 or 8517.12",
  })
  @Length(4, 12)
  hs_code!: string;

  @ApiProperty({ example: "Telephones for cellular networks" })
  @IsString()
  @Length(2, 500)
  description!: string;

  @ApiPropertyOptional({ description: "Percent" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  import_duty_rate?: number;

  @ApiPropertyOptional({ description: "Percent" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  export_duty_rate?: number;

  @ApiPropertyOptional({ example: "9", description: "IMDG/DG class" })
  @IsOptional()
  @IsString()
  dg_class?: string;

  @ApiPropertyOptional({ example: "UN3481" })
  @IsOptional()
  @IsString()
  @Matches(/^UN\d{4}$/, { message: "un_number must look like UN3481" })
  un_number?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_prohibited?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_restricted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateHsCodeDto extends PartialType(CreateHsCodeDto) {}

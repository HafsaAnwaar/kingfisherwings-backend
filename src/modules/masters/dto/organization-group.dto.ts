import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";

export class CreateOrganizationGroupDto {
  @ApiProperty({ example: "GULF" })
  @IsString()
  @Length(1, 30)
  code!: string;

  @ApiProperty({ example: "Gulf Companies" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiPropertyOptional({ type: [String], format: "uuid" })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  company_ids?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateOrganizationGroupDto extends PartialType(CreateOrganizationGroupDto) {}

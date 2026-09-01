import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsPhoneForCountry,
} from "../../../common/validators/country-aware.validators";

export class CreateBranchDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  company_id?: string;

  @ApiProperty({ example: "Dubai Head Office" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "HO" })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Dubai" })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @ApiPropertyOptional({ default: "AE" })
  @IsOptional()
  @CountryCodeField()
  country_code?: string;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional({ example: "dubai@example.com" })
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_head_office?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}

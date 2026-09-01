import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";
import {
  CountryCodeField,
  IsPhoneForCountry,
} from "../../../common/validators/country-aware.validators";

export class CreateTruckerDto {
  @ApiProperty({ example: "Al Futtaim Logistics" })
  @IsString()
  @Length(2, 200)
  name!: string;

  @ApiProperty({ example: "TRK-001" })
  @IsString()
  @Length(1, 20)
  code!: string;

  @ApiPropertyOptional({ example: "AE" })
  @IsOptional()
  @CountryCodeField()
  country_code?: string;

  @ApiPropertyOptional({ example: "+971501234567" })
  @IsOptional()
  @IsPhoneForCountry()
  phone?: string;

  @ApiPropertyOptional({ example: "ops@truckers.ae" })
  @IsOptional()
  @IsStrictEmail()
  email?: string;

  @ApiPropertyOptional({ example: "Ahmed Khan" })
  @IsOptional()
  @IsString()
  @Length(2, 200)
  contact_person?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateTruckerDto extends PartialType(CreateTruckerDto) {}

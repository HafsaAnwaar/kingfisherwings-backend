import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MinLength,
} from "class-validator";
import { IsStrictEmail } from "../../../common/validators/input-format.validators";

export class VendorLoginDto {
  @ApiProperty({ example: "kingfisher" })
  @IsString()
  @Length(2, 100)
  tenant_slug!: string;

  @ApiProperty()
  @IsStrictEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}

export class VendorRefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refresh_token!: string;
}

export class CreateVendorUserDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  party_id!: string;

  @ApiProperty()
  @IsStrictEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @Length(2, 200)
  full_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 30)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  invite_mode?: boolean;
}

export class AcceptVendorInviteDto {
  @ApiProperty()
  @IsString()
  @MinLength(16)
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 200)
  full_name?: string;
}

export class UpdateVendorUserStatusDto {
  @ApiProperty({ enum: ["ACTIVE", "DISABLED", "INVITED"] })
  @IsIn(["ACTIVE", "DISABLED", "INVITED"])
  status!: "ACTIVE" | "DISABLED" | "INVITED";
}

export class ResetVendorPasswordDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  send_email?: boolean;
}

export class VendorUserQueryDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  party_id?: string;
}

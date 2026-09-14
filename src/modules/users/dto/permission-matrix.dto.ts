import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import {
  MATRIX_ACCESS_VALUES,
  type MatrixAccess,
} from "../../../common/constants/matrix-access";

export class PermissionMatrixGrantDto {
  @ApiProperty({ example: "operations" })
  @IsString()
  module!: string;

  @ApiProperty({ example: "air_import" })
  @IsString()
  submodule!: string;

  @ApiPropertyOptional({
    enum: MATRIX_ACCESS_VALUES,
    description:
      "Preferred: none | read | write (write = Read & Write). When set, overrides see/read/write booleans.",
    example: "write",
  })
  @IsOptional()
  @IsEnum(MATRIX_ACCESS_VALUES)
  access?: MatrixAccess;

  @ApiPropertyOptional({
    description: "Legacy. Ignored when `access` is set. Cascades with read/write.",
  })
  @IsOptional()
  @IsBoolean()
  see?: boolean;

  @ApiPropertyOptional({
    description: "Legacy. Ignored when `access` is set.",
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional({
    description: "Legacy. Ignored when `access` is set. Implies read+see.",
  })
  @IsOptional()
  @IsBoolean()
  write?: boolean;
}

export class UpdatePermissionMatrixDto {
  @ApiProperty({ type: [PermissionMatrixGrantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionMatrixGrantDto)
  grants!: PermissionMatrixGrantDto[];
}

/** Compact grant used on create/update user. */
export class PermissionGrantAccessDto {
  @ApiProperty({ example: "wms" })
  @IsString()
  module!: string;

  @ApiProperty({ example: "module" })
  @IsString()
  submodule!: string;

  @ApiProperty({
    enum: MATRIX_ACCESS_VALUES,
    example: "read",
    description: "none | read | write (write = Read & Write)",
  })
  @IsEnum(MATRIX_ACCESS_VALUES)
  access!: MatrixAccess;
}

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  ValidateNested,
} from "class-validator";

export class PermissionMatrixGrantDto {
  @ApiProperty({ example: "operations" })
  @IsString()
  module!: string;

  @ApiProperty({ example: "air_import" })
  @IsString()
  submodule!: string;

  @ApiProperty()
  @IsBoolean()
  see!: boolean;

  @ApiProperty()
  @IsBoolean()
  read!: boolean;

  @ApiProperty()
  @IsBoolean()
  write!: boolean;
}

export class UpdatePermissionMatrixDto {
  @ApiProperty({ type: [PermissionMatrixGrantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionMatrixGrantDto)
  grants!: PermissionMatrixGrantDto[];
}

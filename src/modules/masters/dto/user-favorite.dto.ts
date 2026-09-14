import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateUserFavoriteDto {
  @ApiProperty({ example: "party" })
  @IsString()
  @Length(1, 50)
  entity_type!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  entity_id!: string;

  @ApiPropertyOptional({ example: "Acme Logistics" })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  label?: string;
}

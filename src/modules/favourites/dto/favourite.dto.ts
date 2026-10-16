import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export const FAVOURITE_KINDS = [
  "enquiry",
  "quotation",
  "shipment",
  "job",
  "report_template",
  "report",
  "menu",
  "party",
  "other",
] as const;

export type FavouriteKind = (typeof FAVOURITE_KINDS)[number];

export class CreateFavouriteDto {
  @ApiProperty({
    enum: FAVOURITE_KINDS,
    example: "job",
    description: "Favourite kind",
  })
  @IsString()
  @IsIn([...FAVOURITE_KINDS])
  kind!: FavouriteKind;

  @ApiProperty({
    example: "job:550e8400-e29b-41d4-a716-446655440000",
    description:
      "Stable key — entities: `{kind}:{uuid}`; reports: `report_template:{code}`; menu: `menu:{route_key}`",
  })
  @IsString()
  @Length(1, 200)
  target_key!: string;

  @ApiPropertyOptional({ example: "JOB-2026-001" })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  label?: string;
}

export class ToggleFavouriteDto {
  @ApiProperty({ enum: FAVOURITE_KINDS })
  @IsString()
  @IsIn([...FAVOURITE_KINDS])
  kind!: FavouriteKind;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  target_key!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  label?: string;
}

export class FavouriteCheckQueryDto {
  @ApiProperty({ enum: FAVOURITE_KINDS })
  @IsString()
  @IsIn([...FAVOURITE_KINDS])
  kind!: FavouriteKind;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  target_key!: string;
}

export class FavouriteQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ enum: FAVOURITE_KINDS })
  @IsOptional()
  @IsString()
  kind?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

/** Build entity target_key: `job:{uuid}` */
export function entityFavouriteTargetKey(
  kind: string,
  entityId: string,
): string {
  return `${kind.toLowerCase()}:${entityId}`;
}

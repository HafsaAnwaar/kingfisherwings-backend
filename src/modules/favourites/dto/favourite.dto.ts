import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateFavouriteDto {
  @ApiProperty({
    example: "menu",
    description: "Favourite kind (menu, report, entity, …)",
  })
  @IsString()
  @Length(1, 40)
  kind!: string;

  @ApiProperty({
    example: "crm.enquiries",
    description: "Stable key for the bookmarked target",
  })
  @IsString()
  @Length(1, 200)
  target_key!: string;

  @ApiPropertyOptional({ example: "CRM Enquiries" })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  label?: string;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kind?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

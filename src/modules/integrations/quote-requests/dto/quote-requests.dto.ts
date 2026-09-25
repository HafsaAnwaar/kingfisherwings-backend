import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { ExternalQuoteRequestProvider } from "@prisma/client";

export class UpsertQuoteRequestConnectionDto {
  @ApiProperty({
    example: "https://kingfisherwingsgroup.com/wp-json/kfpp/v1",
  })
  @IsUrl({ require_tld: false })
  @Length(8, 500)
  base_url!: string;

  @ApiProperty({ description: "Write-only. Never returned on GET." })
  @IsString()
  @MinLength(8)
  api_key!: string;

  @ApiPropertyOptional({ enum: ExternalQuoteRequestProvider })
  @IsOptional()
  @IsEnum(ExternalQuoteRequestProvider)
  provider?: ExternalQuoteRequestProvider;

  @ApiPropertyOptional({ default: "X-KFPP-Api-Key" })
  @IsOptional()
  @IsString()
  @Length(3, 80)
  auth_header_name?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: "Optional remote→local status map JSON object",
  })
  @IsOptional()
  @IsObject()
  status_map?: Record<string, string>;
}

export class QuoteRequestListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class PatchQuoteRequestStatusDto {
  @ApiProperty({ example: "pending" })
  @IsString()
  @Length(1, 80)
  status!: string;
}

export class UpdateTenantQuoteRequestsFeatureDto {
  @ApiProperty()
  @IsBoolean()
  quote_requests_bridge!: boolean;
}

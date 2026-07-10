import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

const SEARCH_TYPES = ['jobs', 'quotations', 'parties'] as const;
export type SearchEntityType = (typeof SEARCH_TYPES)[number];

export class SearchQueryDto {
  @ApiProperty({ example: 'KFW/AE', description: 'Free-text search across jobs, quotations, and parties' })
  @IsString()
  @MinLength(1)
  q!: string;

  @ApiPropertyOptional({
    example: 'jobs,quotations,parties',
    description: 'Comma-separated entity types to search (default: all)',
  })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export function parseSearchTypes(types?: string): SearchEntityType[] {
  if (!types) {
    return [...SEARCH_TYPES];
  }

  const requested = types.split(',').map((t) => t.trim().toLowerCase());
  return SEARCH_TYPES.filter((t) => requested.includes(t));
}

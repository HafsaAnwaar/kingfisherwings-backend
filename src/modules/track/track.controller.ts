import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorators';
import { TrackService } from './track.service';

class TrackQueryDto {
  @ApiProperty({ example: 'kingfisher', description: 'Tenant slug for branding + data scope.' })
  @IsString()
  @Length(2, 100)
  tenant_slug!: string;

  @ApiProperty({ example: 'KFW-J-00042', description: 'Job number, HAWB, MAWB, HBL, MBL, or booking #.' })
  @IsString()
  @Length(2, 100)
  ref!: string;
}

class TrackEmbedQueryDto {
  @ApiPropertyOptional({ example: 'kingfisher' })
  @IsString()
  @Length(2, 100)
  tenant_slug!: string;
}

/**
 * Public Track & Trace (Ch.24.2) — no auth.
 * Sanitized: no charges, GP, costs, internal notes, or other parties’ PII.
 */
@ApiTags('Public Track & Trace')
@Public()
@Controller('track')
export class TrackController {
  constructor(private readonly track: TrackService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Public shipment track by reference',
    description:
      'Anyone with a job / BL / AWB reference can view a sanitized timeline. Requires tenant_slug.',
  })
  trackShipment(@Query() query: TrackQueryDto) {
    return this.track.track(query.tenant_slug, query.ref);
  }

  @Get('embed')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Embed widget config (tenant branding)',
    description: 'Returns branding + endpoint hints for embedding a track widget on the tenant website.',
  })
  embed(@Query() query: TrackEmbedQueryDto) {
    return this.track.embedConfig(query.tenant_slug);
  }
}

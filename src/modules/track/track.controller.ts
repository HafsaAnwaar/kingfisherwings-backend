import { Controller, Get, Header, Headers, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IsOptional, IsString, Length } from 'class-validator';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorators';
import { TrackService } from './track.service';

class TrackQueryDto {
  @ApiPropertyOptional({ example: 'kingfisher', description: 'Tenant slug. Optional if Host matches Tenant.domain.' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  tenant_slug?: string;

  @ApiProperty({ example: 'KFW-J-00042', description: 'Job number, HAWB, MAWB, HBL, MBL, or booking #.' })
  @IsString()
  @Length(2, 100)
  ref!: string;
}

class TrackEmbedQueryDto {
  @ApiPropertyOptional({ example: 'kingfisher' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  tenant_slug?: string;
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
      'Anyone with a job / BL / AWB reference can view a sanitized timeline. Resolve tenant via tenant_slug or Host/domain.',
  })
  trackShipment(
    @Query() query: TrackQueryDto,
    @Headers('host') host?: string,
    @Headers('x-tenant-domain') tenantDomain?: string,
  ) {
    return this.track.track(query.ref, {
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
  }

  @Get('embed')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Embed widget config (tenant branding)',
    description: 'Returns branding + endpoint hints for embedding a track widget on the tenant website.',
  })
  embed(
    @Query() query: TrackEmbedQueryDto,
    @Headers('host') host?: string,
    @Headers('x-tenant-domain') tenantDomain?: string,
  ) {
    return this.track.embedConfig({
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
  }

  @Get('widget.js')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Header('Content-Type', 'application/javascript; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=300')
  @ApiOperation({
    summary: 'Drop-in Track & Trace widget script',
    description:
      'Serve as <script src="/track/widget.js?tenant_slug=...">. Renders a search box and calls GET /track.',
  })
  async widgetJs(
    @Query() query: TrackEmbedQueryDto,
    @Headers('host') host?: string,
    @Headers('x-tenant-domain') tenantDomain?: string,
    @Res() res?: Response,
  ) {
    const js = await this.track.widgetScript({
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
    res!.type('application/javascript').send(js);
  }
}

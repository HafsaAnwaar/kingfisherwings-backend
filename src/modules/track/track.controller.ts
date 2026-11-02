import {
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Query,
  Res,
  StreamableFile,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { IsOptional, IsString, Length } from "class-validator";
import { Response } from "express";
import { Public } from "../../common/decorators/public.decorators";
import { TrackService } from "./track.service";
import { TrackShipmentResponseDto } from "./dto/track-response.dto";

class TrackQueryDto {
  @ApiPropertyOptional({
    example: "kingfisher",
    deprecated: true,
    description:
      "Optional tenant hint only. Not required — public track resolves by container / BL / AWB alone.",
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  tenant_slug?: string;

  @ApiProperty({
    example: "MSCU1234567",
    description:
      "Container number, HBL/MBL, HAWB/MAWB, booking ref, or public tracking token. No tenant slug or username required.",
  })
  @IsString()
  @Length(2, 100)
  ref!: string;
}

class TrackEmbedQueryDto {
  @ApiPropertyOptional({ example: "kingfisher" })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  tenant_slug?: string;
}

/**
 * Public Track & Trace (Ch.24.2) — no auth.
 * Sanitized: no charges, GP, costs, internal notes, or other parties’ PII.
 */
@ApiTags("Public Track & Trace")
@Public()
@Controller("track")
export class TrackController {
  constructor(private readonly track: TrackService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: "Public shipment track by reference",
    description:
      "No auth and no tenant_slug required. Pass only ref = container number, BL (HBL/MBL), or AWB (HAWB/MAWB). Returns current_status, container meta, progress_legs, and history.",
  })
  @ApiOkResponse({ type: TrackShipmentResponseDto })
  trackShipment(
    @Query() query: TrackQueryDto,
    @Headers("host") host?: string,
    @Headers("x-tenant-domain") tenantDomain?: string,
  ) {
    return this.track.track(query.ref, {
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
  }

  @Get("pdf")
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @ApiOperation({
    summary: "Public Track & Trace PDF export",
    description:
      "Same as GET /track — ref only (container / BL / AWB). No tenant_slug required.",
  })
  @ApiProduces("application/pdf")
  async trackPdf(
    @Query() query: TrackQueryDto,
    @Headers("host") host?: string,
    @Headers("x-tenant-domain") tenantDomain?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const { buffer, filename } = await this.track.trackPdf(query.ref, {
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
    res!.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Get("embed")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({
    summary: "Embed widget config (tenant branding)",
    description:
      "Returns branding + endpoint hints for embedding a track widget on the tenant website.",
  })
  embed(
    @Query() query: TrackEmbedQueryDto,
    @Headers("host") host?: string,
    @Headers("x-tenant-domain") tenantDomain?: string,
  ) {
    return this.track.embedConfig({
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
  }

  @Get("widget.js")
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Header("Content-Type", "application/javascript; charset=utf-8")
  @Header("Cache-Control", "public, max-age=300")
  @ApiOperation({
    summary: "Drop-in Track & Trace widget script",
    description:
      'Serve as <script src="/track/widget.js?tenant_slug=...">. Renders a search box and calls GET /track.',
  })
  async widgetJs(
    @Query() query: TrackEmbedQueryDto,
    @Headers("host") host?: string,
    @Headers("x-tenant-domain") tenantDomain?: string,
    @Res() res?: Response,
  ) {
    const js = await this.track.widgetScript({
      tenantSlug: query.tenant_slug,
      host: tenantDomain || host,
    });
    res!.type("application/javascript").send(js);
  }

  @Get(":ref")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary: "Public track by path reference (container / BL / AWB / token)",
    description:
      "Same as GET /track?ref=… — no tenant_slug required. Share links: /track/{token}.",
  })
  trackByPath(
    @Param("ref") ref: string,
    @Query("tenant_slug") tenantSlug?: string,
    @Headers("host") host?: string,
    @Headers("x-tenant-domain") tenantDomain?: string,
  ) {
    return this.track.track(ref, {
      tenantSlug,
      host: tenantDomain || host,
    });
  }
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorators';
import { CurrentPortal } from './decorators/portal.decorators';
import { PortalQuotationQueryDto, PortalQuotationRequestDto } from './dto/portal-quotation.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalQuotationsService } from './portal-quotations.service';

/**
 * Customer Portal — Quotations submodule.
 * Customers request quotes (POST) and view quotes issued to their Party (GET).
 * Cost lines, GP, and internal notes are never returned.
 */
@ApiTags('Portal Quotations')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/quotations')
export class PortalQuotationsController {
  constructor(private readonly quotations: PortalQuotationsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Quotation dashboard counters for the logged-in customer' })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.quotations.summary(user);
  }

  @Post('request')
  @ApiOperation({
    summary: 'Request a new freight quote',
    description:
      'Creates a quotation enquiry bound to the portal user’s Party. Staff price and send the formal quote.',
  })
  request(@CurrentPortal() user: CurrentPortalUser, @Body() dto: PortalQuotationRequestDto) {
    return this.quotations.requestQuote(user, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List my quotations',
    description: 'Quotes for this customer Party. Excludes internal staff-only drafts.',
  })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalQuotationQueryDto) {
    return this.quotations.list(user, query);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download customer-facing quotation PDF when generated' })
  downloadPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.quotations.downloadPdf(user, id, res);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Quotation detail',
    description: 'Revenue lines only — no cost lines, GP, or internal notes.',
  })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotations.findOne(user, id);
  }
}

import { Controller, Get, Param, ParseUUIDPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorators';
import { CurrentPortal } from './decorators/portal.decorators';
import { PortalDocumentQueryDto } from './dto/portal-document-query.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalDocumentsService } from './portal-documents.service';
import { PortalPermissionsService } from './portal-permissions.service';

/**
 * Customer Portal — Documents hub.
 * Unified library across shipment job documents and invoice/credit-note PDFs.
 * Visibility and download are gated by staff-configured portal_permissions.
 */
@ApiTags('Portal Documents')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/documents')
export class PortalDocumentsController {
  constructor(
    private readonly documents: PortalDocumentsService,
    private readonly permissions: PortalPermissionsService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Document library counters for the logged-in customer' })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.documents.summary(user);
  }

  @Get('permissions')
  @ApiOperation({
    summary: 'Effective document rights for this customer',
    description: 'Read-only view of what document types this Party can view or download.',
  })
  effectivePermissions(@CurrentPortal() user: CurrentPortalUser) {
    return this.permissions.getEffectiveForPortalUser(user.tenantId, user.partyId);
  }

  @Get()
  @ApiOperation({
    summary: 'List all documents visible to this customer',
    description:
      'Includes shipment documents (HAWB, HBL, POD, etc.) and invoice/credit-note PDFs. Filter by source, job, or document type.',
  })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalDocumentQueryDto) {
    return this.documents.listAll(user, query);
  }

  @Get('invoices/:invoiceId/download')
  @ApiOperation({ summary: 'Download an invoice or credit note PDF' })
  downloadInvoice(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Res() res: Response,
  ) {
    return this.documents.downloadInvoice(user, invoiceId, res);
  }

  @Get('jobs/:jobId/:docId/download')
  @ApiOperation({ summary: 'Download a shipment job document' })
  downloadJobDocument(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @Res() res: Response,
  ) {
    return this.documents.downloadJobDocument(user, jobId, docId, res);
  }
}

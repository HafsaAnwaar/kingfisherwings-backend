import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorators';
import { CurrentPortal } from './decorators/portal.decorators';
import {
  PortalCreditAgingQueryDto,
  PortalInvoiceQueryDto,
  PortalPaymentQueryDto,
} from './dto/portal-finance.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalFinanceService } from './portal-finance.service';

@ApiTags('Portal Invoices')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/invoices')
export class PortalInvoicesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Invoice outstanding / overdue counters' })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.invoiceSummary(user);
  }

  @Get()
  @ApiOperation({ summary: 'List my customer invoices' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalInvoiceQueryDto) {
    return this.finance.listInvoices(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Invoice detail (no internal notes)' })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.finance.getInvoice(user, id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice PDF if permitted' })
  downloadPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.finance.downloadInvoicePdf(user, id, res);
  }
}

@ApiTags('Portal Credit Notes')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/credit-notes')
export class PortalCreditNotesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: 'List credit notes applied to my account' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalInvoiceQueryDto) {
    return this.finance.listCreditNotes(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Credit note detail' })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.finance.getInvoice(user, id);
  }
}

@ApiTags('Portal Debit Notes')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/debit-notes')
export class PortalDebitNotesController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: 'List debit notes on my account' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalInvoiceQueryDto) {
    return this.finance.listDebitNotes(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Debit note detail' })
  detail(@CurrentPortal() user: CurrentPortalUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.finance.getInvoice(user, id);
  }
}

@ApiTags('Portal Payments')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/payments')
export class PortalPaymentsController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get()
  @ApiOperation({ summary: 'Payment / receipt history for my account' })
  list(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalPaymentQueryDto) {
    return this.finance.listPayments(user, query);
  }
}

@ApiTags('Portal Credit (CCP)')
@ApiBearerAuth()
@Public()
@UseGuards(PortalAuthGuard)
@Controller('portal/credit')
export class PortalCreditController {
  constructor(private readonly finance: PortalFinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Credit limit, used, available' })
  summary(@CurrentPortal() user: CurrentPortalUser) {
    return this.finance.creditSummary(user);
  }

  @Get('aging')
  @ApiOperation({ summary: 'AR aging buckets for my account' })
  aging(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalCreditAgingQueryDto) {
    return this.finance.creditAging(user, query);
  }

  @Get('statement')
  @ApiOperation({ summary: 'AR account statement (JSON)' })
  statement(@CurrentPortal() user: CurrentPortalUser, @Query() query: PortalCreditAgingQueryDto) {
    return this.finance.creditStatement(user, query);
  }

  @Get('statement.pdf')
  @ApiOperation({ summary: 'Download AR statement PDF (requires STATEMENT download permission)' })
  statementPdf(
    @CurrentPortal() user: CurrentPortalUser,
    @Query() query: PortalCreditAgingQueryDto,
    @Res() res: Response,
  ) {
    return this.finance.downloadStatementPdf(user, query, res);
  }
}

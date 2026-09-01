import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import "multer";
import { SkipStaffJwt } from "../../common/decorators/skip-staff-jwt.decorator";
import { CurrentVendor } from "./decorators/vendor.decorators";
import {
  VendorInvoiceQueryDto,
  VendorSubmitInvoiceDto,
} from "./dto/vendor-finance.dto";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorCcpService } from "./vendor-ccp.service";
import { VendorFinanceService } from "./vendor-finance.service";

const PDF_MIME = new Set(["application/pdf"]);

@ApiTags("Vendor Invoices")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor/invoices")
export class VendorInvoicesController {
  constructor(
    private readonly finance: VendorFinanceService,
    private readonly ccp: VendorCcpService,
  ) {}

  @Get("summary")
  @ApiOperation({ summary: "Purchase invoice outstanding / overdue counters" })
  summary(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.invoiceSummary(user);
  }

  @Get("export.csv")
  @ApiOperation({ summary: "Export my purchase invoices as CSV" })
  exportCsv(@CurrentVendor() user: CurrentVendorUser, @Res() res: Response) {
    return this.finance.exportInvoicesCsv(user, res);
  }

  @Post("submit")
  @ApiConsumes("multipart/form-data", "application/json")
  @ApiOperation({
    summary: "Submit a draft purchase invoice for finance review",
  })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, callback) => {
        if (!PDF_MIME.has(file.mimetype)) {
          return callback(
            new BadRequestException("Only PDF attachments are accepted."),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async submit(
    @CurrentVendor() user: CurrentVendorUser,
    @Body() dto: VendorSubmitInvoiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const attachmentPath = await this.ccp.storeOptionalUpload(
      user.tenantId,
      file,
    );
    return this.finance.submitInvoice(user, dto, attachmentPath);
  }

  @Get()
  @ApiOperation({ summary: "List my purchase invoices" })
  list(
    @CurrentVendor() user: CurrentVendorUser,
    @Query() query: VendorInvoiceQueryDto,
  ) {
    return this.finance.listInvoices(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Purchase invoice detail" })
  detail(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.getInvoice(user, id);
  }

  @Get(":id/pdf")
  @ApiOperation({ summary: "Download purchase invoice PDF" })
  downloadPdf(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.finance.downloadInvoicePdf(user, id, res);
  }
}

@ApiTags("Vendor Payments")
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(VendorAuthGuard)
@Controller("vendor")
export class VendorPaymentsController {
  constructor(private readonly finance: VendorFinanceService) {}

  @Get("payments")
  @ApiOperation({ summary: "Posted payments to this vendor" })
  payments(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.listPayments(user);
  }

  @Get("payments/:id/remittance.pdf")
  @ApiOperation({ summary: "Remittance advice PDF" })
  remittance(
    @CurrentVendor() user: CurrentVendorUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return this.finance.remittancePdf(user, id, res);
  }

  @Get("credit-notes")
  @ApiOperation({ summary: "Purchase-side credit notes for this vendor" })
  creditNotes(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.listCreditNotes(user);
  }

  @Get("advances")
  @ApiOperation({ summary: "Unallocated posted payments" })
  advances(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.listAdvances(user);
  }

  @Get("credit/aging")
  @ApiOperation({ summary: "AP aging for this vendor" })
  aging(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.aging(user);
  }

  @Get("credit/statement")
  @ApiOperation({ summary: "AP statement for this vendor" })
  statement(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.statement(user);
  }

  @Get("credit/statement.pdf")
  @ApiOperation({ summary: "AP statement PDF" })
  statementPdf(@CurrentVendor() user: CurrentVendorUser, @Res() res: Response) {
    return this.finance.statementPdf(user, res);
  }

  @Get("schedule")
  @ApiOperation({ summary: "Open purchase invoices with due dates" })
  schedule(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.schedule(user);
  }

  @Get("payment-requests")
  @ApiOperation({ summary: "Payment requests raised against this vendor" })
  paymentRequests(@CurrentVendor() user: CurrentVendorUser) {
    return this.finance.listPaymentRequests(user);
  }

  @Get("documents/tds")
  @ApiOperation({ summary: "TDS certificates (India Phase 3 placeholder)" })
  tds() {
    return this.finance.tdsPlaceholder();
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiPropertyOptional, ApiTags } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { NVOCC_PERMISSIONS } from "./constants/nvocc-permission.constants";
import { NvoccBookingFormService } from "./nvocc-booking-form.service";
import { NvoccContainerRequestService } from "./nvocc-container-request.service";
import { NvoccWorkflowActionsService } from "./nvocc-workflow-actions.service";
import {
  UpsertNvoccBookingFormDto,
  WorkflowStageOverrideDto,
} from "./dto/nvocc-booking-form.dto";
import {
  AllocateContainersDto,
  CreateNvoccContainerRequestDto,
} from "./dto/nvocc-container-request.dto";
import { GenerateJobDocumentDto } from "./dto/nvocc-document.dto";

class MarkInvoiceSentDto extends WorkflowStageOverrideDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  invoice_id?: string;
}

@ApiTags("NVOCC — Workflow")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("nvocc")
export class NvoccWorkflowController {
  constructor(
    private readonly bookingForms: NvoccBookingFormService,
    private readonly containerRequests: NvoccContainerRequestService,
    private readonly actions: NvoccWorkflowActionsService,
  ) {}

  @Post("bookings/:id/cs-triage")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "CS: grant portal access and mark CS_TRIAGED" })
  csTriage(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.actions.csTriage(user.tenantId, id, user, dto);
  }

  @Post("bookings/:id/mark-quote-sent")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Sales/Admin: mark QUOTE_SENT after sending quote" })
  markQuoteSent(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.actions.markQuoteSent(user.tenantId, id, user, dto);
  }

  @Get("bookings/:id/booking-form")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Kingfisher booking form" })
  getForm(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.bookingForms.get(tenantId, id);
  }

  @Put("bookings/:id/booking-form")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Ops: upsert Kingfisher booking form (Excel field parity)",
  })
  upsertForm(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertNvoccBookingFormDto,
  ) {
    return this.bookingForms.upsert(user.tenantId, id, dto, user);
  }

  @Post("bookings/:id/send-invoice")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Sales/Admin: mark INVOICE_SENT (link optional invoice_id)",
  })
  sendInvoice(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MarkInvoiceSentDto,
  ) {
    return this.actions.markInvoiceSent(
      user.tenantId,
      id,
      dto.invoice_id,
      user,
      dto,
    );
  }

  @Get("jobs/:id/container-requests")
  @RequirePermissions(NVOCC_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "List CRO / container requests for job" })
  listCro(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.containerRequests.listForJob(tenantId, id);
  }

  @Post("jobs/:id/container-requests")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "CS: create container request (CRO form, manual)" })
  createCro(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateNvoccContainerRequestDto,
  ) {
    return this.containerRequests.create(user.tenantId, id, dto, user);
  }

  @Post("jobs/:jobId/container-requests/:requestId/issue")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "CS: issue CRO to portal" })
  issueCro(
    @CurrentUser() user: CurrentUserType,
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.containerRequests.issue(
      user.tenantId,
      jobId,
      requestId,
      user,
      dto,
    );
  }

  @Post("jobs/:jobId/container-requests/:requestId/allocate")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Ops: auto-generate container numbers" })
  allocate(
    @CurrentUser() user: CurrentUserType,
    @Param("jobId", ParseUUIDPipe) jobId: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Body() dto: AllocateContainersDto,
  ) {
    return this.containerRequests.allocate(
      user.tenantId,
      jobId,
      requestId,
      dto,
      user,
    );
  }

  @Post("jobs/:id/stage/loading")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Ops: mark LOADING stage" })
  loading(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.actions.markLoading(user.tenantId, id, user, dto);
  }

  @Post("jobs/:id/accounts/confirm-payment")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Accounts: confirm payment (gates original BL)" })
  confirmPayment(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.actions.confirmPayment(user.tenantId, id, user, dto);
  }

  @Post("jobs/:id/documents/hbl-draft-gated")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Docs: issue draft HBL and advance DRAFT_BL_ISSUED" })
  draftBl(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueDraftBl(user.tenantId, id, dto, user);
  }

  @Post("jobs/:id/documents/hbl-original-gated")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary: "Docs: issue original HBL (requires payment confirmed)",
  })
  originalBl(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueOriginalBl(user.tenantId, id, dto, user);
  }

  @Post("jobs/:id/close-report")
  @RequirePermissions(NVOCC_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "MGMT: close workflow and return closure report" })
  closeReport(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: WorkflowStageOverrideDto,
  ) {
    return this.actions.closeReport(user.tenantId, id, user, dto);
  }
}

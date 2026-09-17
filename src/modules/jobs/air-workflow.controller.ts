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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../users/interfaces/current-user.interface";
import { JOBS_PERMISSIONS } from "./constants/jobs-permission.constants";
import { AirBookingFormService } from "./air-booking-form.service";
import { AirUldRequestService } from "./air-uld-request.service";
import { AirWorkflowActionsService } from "./air-workflow-actions.service";
import { AirWorkflowService } from "./air-workflow.service";
import {
  AirWorkflowOverrideDto,
  AllocateUldDto,
  CreateAirUldRequestDto,
  MarkAirInvoiceSentDto,
  UpsertAirBookingFormDto,
} from "./dto/air-workflow.dto";
import { GenerateJobDocumentDto } from "./dto/generate-job-document.dto";

@ApiTags("Jobs — Air Workflow")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs")
export class AirWorkflowController {
  constructor(
    private readonly bookingForms: AirBookingFormService,
    private readonly uldRequests: AirUldRequestService,
    private readonly actions: AirWorkflowActionsService,
    private readonly workflow: AirWorkflowService,
  ) {}

  @Post(":id/air/cs-triage")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "CS: grant portal access and mark CS_TRIAGED" })
  csTriage(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.csTriage(user.tenantId, id, user, dto);
  }

  @Post(":id/air/mark-quote-sent")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Sales/Admin: mark QUOTE_SENT" })
  markQuoteSent(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.markQuoteSent(user.tenantId, id, user, dto);
  }

  @Get(":id/air-booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get air booking form with pallet specs" })
  getForm(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.bookingForms.get(tenantId, id);
  }

  @Put(":id/air-booking-form")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Ops: upsert air booking form (export/import mandatory fields)",
  })
  upsertForm(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertAirBookingFormDto,
  ) {
    return this.bookingForms.upsert(user.tenantId, id, dto, user);
  }

  @Post(":id/air/send-invoice")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Sales/Admin: mark INVOICE_SENT" })
  sendInvoice(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: MarkAirInvoiceSentDto,
  ) {
    return this.actions.markInvoiceSent(user.tenantId, id, dto, user);
  }

  @Get(":id/air/uld-requests")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  listUld(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.uldRequests.listForJob(tenantId, id);
  }

  @Post(":id/air/uld-requests")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "CS: create Unit Load Device / pallet request" })
  createUld(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateAirUldRequestDto,
  ) {
    return this.uldRequests.create(user.tenantId, id, dto, user);
  }

  @Post(":id/air/uld-requests/:requestId/issue")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "CS: issue ULD request to portal" })
  issueUld(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.uldRequests.issue(user.tenantId, id, requestId, user, dto);
  }

  @Post(":id/air/uld-requests/:requestId/allocate")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Ops: auto-allocate Unit Load Device numbers" })
  allocateUld(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("requestId", ParseUUIDPipe) requestId: string,
    @Body() dto: AllocateUldDto,
  ) {
    return this.uldRequests.allocate(user.tenantId, id, requestId, dto, user);
  }

  @Post(":id/air/stage/build-up")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  buildUp(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.markBuildUp(user.tenantId, id, user, dto);
  }

  @Post(":id/air/stage/mawb-received")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  mawbReceived(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.markMawbReceived(user.tenantId, id, user, dto);
  }

  @Post(":id/air/stage/pod")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  pod(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.markPod(user.tenantId, id, user, dto);
  }

  @Post(":id/air/accounts/confirm-payment")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  confirmPayment(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.confirmPayment(user.tenantId, id, user, dto);
  }

  @Post(":id/documents/hawb-draft-gated")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  hawbDraft(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueHawbDraft(user.tenantId, id, dto, user);
  }

  @Post(":id/documents/hawb-final-gated")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  hawbFinal(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueHawbFinal(user.tenantId, id, dto, user);
  }

  @Post(":id/documents/pre-can-gated")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  preCan(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issuePreCan(user.tenantId, id, dto, user);
  }

  @Post(":id/documents/can-gated")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  can(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueCan(user.tenantId, id, dto, user);
  }

  @Post(":id/documents/delivery-order-gated")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  deliveryOrder(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: GenerateJobDocumentDto,
  ) {
    return this.actions.issueDeliveryOrder(user.tenantId, id, dto, user);
  }

  @Post(":id/air/close-report")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  closeReport(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.actions.closeReport(user.tenantId, id, user, dto);
  }

  @Post(":id/air/stage/mawb-issued")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({
    summary: "Ops/Docs: advance MAWB_ISSUED after Master Air Waybill stock use",
  })
  mawbIssued(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AirWorkflowOverrideDto,
  ) {
    return this.workflow.setJobStage(user.tenantId, id, "MAWB_ISSUED", user, {
      override: dto.admin_override,
      overrideReason: dto.stage_override_reason,
      allowSkip: dto.admin_override,
    });
  }
}

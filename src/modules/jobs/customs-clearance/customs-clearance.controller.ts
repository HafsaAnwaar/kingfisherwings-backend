import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../../users/guards/roles.guard";
import { PermissionsGuard } from "../../users/guards/permissions.guard";
import { RequirePermissions } from "../../users/decorators/permissions.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";
import { CurrentUser as CurrentUserType } from "../../users/interfaces/current-user.interface";
import { JOBS_PERMISSIONS } from "../constants/jobs-permission.constants";
import { CustomsClearanceService } from "./customs-clearance.service";
import {
  AssessCcDto,
  CcWorkflowOverrideDto,
  ClassifyCcLineDto,
  CreateCcCargoLineDto,
  CreateCcQueryDto,
  DutyPaidDto,
  FileCcEntryDto,
  LinkFreightDto,
  PatchCcChecklistItemDto,
  PatchCcFilingDto,
  PatchCcQueryDto,
  UpdateCcCargoLineDto,
  UpsertCcDeclarationDto,
  UpsertCcDetailsDto,
} from "./dto/customs-clearance.dto";

@ApiTags("Jobs — Customs Clearance")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("jobs")
export class CustomsClearanceController {
  constructor(private readonly cc: CustomsClearanceService) {}

  @Get(":id/cc/details")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "Get Customs Clearance detail" })
  getDetails(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.getDetails(tenantId, id);
  }

  @Patch(":id/cc/details")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Upsert CC detail fields" })
  upsertDetails(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertCcDetailsDto,
  ) {
    return this.cc.upsertDetails(tenantId, id, dto, actorId);
  }

  @Post(":id/cc/open")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: "Open CC job for Ops (→ OPS_OPEN)" })
  open(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.open(user.tenantId, id, user, dto);
  }

  @Get(":id/cc/status")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  @ApiOperation({ summary: "CC workflow status + next action" })
  status(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.getStatus(tenantId, id);
  }

  @Get(":id/cc/lines")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  listLines(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.listLines(tenantId, id);
  }

  @Post(":id/cc/lines")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  addLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCcCargoLineDto,
  ) {
    return this.cc.addLine(tenantId, id, dto, actorId);
  }

  @Patch(":id/cc/lines/:lineId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  updateLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateCcCargoLineDto,
  ) {
    return this.cc.updateLine(tenantId, id, lineId, dto, actorId);
  }

  @Delete(":id/cc/lines/:lineId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  deleteLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
  ) {
    return this.cc.deleteLine(tenantId, id, lineId, actorId);
  }

  @Post(":id/cc/lines/:lineId/classify")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  classifyLine(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: ClassifyCcLineDto,
  ) {
    return this.cc.classifyLine(tenantId, id, lineId, dto, actorId);
  }

  @Get(":id/cc/checklist")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  checklist(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.getChecklist(tenantId, id);
  }

  @Patch(":id/cc/checklist/:itemId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  patchChecklist(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("itemId", ParseUUIDPipe) itemId: string,
    @Body() dto: PatchCcChecklistItemDto,
  ) {
    return this.cc.patchChecklistItem(tenantId, id, itemId, dto, actorId);
  }

  @Post(":id/cc/checklist/seed")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  seedChecklist(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.seedChecklistEndpoint(tenantId, id, actorId);
  }

  @Post(":id/cc/stage/docs-complete")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  docsComplete(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageDocsComplete(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/classify")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageClassify(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageClassify(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/file")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageFile(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: FileCcEntryDto,
  ) {
    return this.cc.stageFile(user.tenantId, id, user, dto);
  }

  @Patch(":id/cc/filing")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  patchFiling(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: PatchCcFilingDto,
  ) {
    return this.cc.patchFiling(tenantId, id, dto, actorId);
  }

  @Post(":id/cc/stage/assess")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageAssess(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: AssessCcDto,
  ) {
    return this.cc.stageAssess(user.tenantId, id, user, dto);
  }

  @Get(":id/cc/queries")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  listQueries(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.listQueries(tenantId, id);
  }

  @Post(":id/cc/queries")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  createQuery(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CreateCcQueryDto,
  ) {
    return this.cc.createQuery(tenantId, id, dto, actorId);
  }

  @Patch(":id/cc/queries/:queryId")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  patchQuery(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("queryId", ParseUUIDPipe) queryId: string,
    @Body() dto: PatchCcQueryDto,
  ) {
    return this.cc.patchQuery(tenantId, id, queryId, dto, actorId);
  }

  @Post(":id/cc/queries/:queryId/close")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  closeQuery(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Param("queryId", ParseUUIDPipe) queryId: string,
  ) {
    return this.cc.closeQuery(tenantId, id, queryId, actorId);
  }

  @Post(":id/cc/duty-payment-request")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  dutyRequest(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.dutyPaymentRequest(tenantId, id, actorId);
  }

  @Post(":id/cc/stage/duty-paid")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  dutyPaid(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: DutyPaidDto,
  ) {
    return this.cc.stageDutyPaid(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/clear")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageClear(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageClear(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/release")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageRelease(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageRelease(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/invoice-ready")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  invoiceReady(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageInvoiceReady(user.tenantId, id, user, dto);
  }

  @Post(":id/cc/stage/close")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  stageClose(
    @CurrentUser() user: CurrentUserType,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: CcWorkflowOverrideDto,
  ) {
    return this.cc.stageClose(user.tenantId, id, user, dto);
  }

  @Get(":id/cc/financial-summary")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  financial(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.financialSummary(tenantId, id);
  }

  @Post(":id/cc/link-freight")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  linkFreight(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: LinkFreightDto,
  ) {
    return this.cc.linkFreight(tenantId, id, dto, actorId);
  }

  @Delete(":id/cc/link-freight")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  unlinkFreight(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.unlinkFreight(tenantId, id, actorId);
  }

  @Get(":id/cc/link-freight")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  getLink(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.getFreightLink(tenantId, id);
  }

  @Get(":id/cc/declaration")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  getDeclaration(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.getDeclaration(tenantId, id);
  }

  @Put(":id/cc/declaration")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  putDeclaration(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpsertCcDeclarationDto,
  ) {
    return this.cc.putDeclaration(tenantId, id, dto, actorId);
  }

  @Post(":id/cc/declaration/validate")
  @RequirePermissions(JOBS_PERMISSIONS.VIEW)
  validateDeclaration(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.validateDeclaration(tenantId, id);
  }

  @Post(":id/cc/declaration/submit-local")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  submitLocal(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.submitLocalDeclaration(tenantId, id, actorId);
  }

  @Post(":id/cc/documents/entry-pack")
  @RequirePermissions(JOBS_PERMISSIONS.UPDATE)
  entryPack(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.cc.generateEntryPack(tenantId, id, actorId);
  }
}

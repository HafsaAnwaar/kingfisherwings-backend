import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { DOCUMENTATION_PERMISSIONS } from "./constants/documentation-permission.constants";
import {
  DocumentationEdiService,
  EdiListQueryDto,
} from "./documentation-edi.service";

@ApiTags("Documentation — EDI")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("documentation/edi")
export class DocumentationEdiController {
  constructor(private readonly ediService: DocumentationEdiService) {}

  @Get("bayan/jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  bayanMasterJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "BAYAN_MASTER", query);
  }

  @Post("bayan/jobs/:jobId/generate")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  bayanGenerate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "BAYAN_MASTER", jobId, actorId);
  }

  @Post("bayan/jobs/:jobId/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async bayanSubmit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    const generated = await this.ediService.generate(
      tenantId,
      "BAYAN_MASTER",
      jobId,
      actorId,
    );
    return this.ediService.submit(tenantId, generated.id, actorId);
  }

  @Post("bayan/jobs/:jobId/amend")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  bayanAmend(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService
      .generate(tenantId, "BAYAN_MASTER", jobId, actorId)
      .then((sub) => this.ediService.amend(tenantId, sub.id, actorId));
  }

  @Get("bayan/shipments")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  bayanHouseShipments(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "BAYAN_HOUSE", query);
  }

  @Get("submissions/:submissionId/download")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  download(
    @CurrentUser("tenantId") tenantId: string,
    @Param("submissionId", ParseUUIDPipe) submissionId: string,
  ) {
    return this.ediService.getDownloadUrl(tenantId, submissionId);
  }

  @Get("ccn/jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  ccnJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "CCN_FWB", query);
  }

  @Post("ccn/jobs/:jobId/fwb/generate")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  ccnFwb(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "CCN_FWB", jobId, actorId);
  }

  @Post("ccn/jobs/:jobId/fhl/generate")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  ccnFhl(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "CCN_FHL", jobId, actorId);
  }

  @Post("ccn/jobs/:jobId/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async ccnSubmit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    const generated = await this.ediService.generate(
      tenantId,
      "CCN_FWB",
      jobId,
      actorId,
    );
    return this.ediService.submit(tenantId, generated.id, actorId);
  }

  @Get("eqo/dubai/jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  eqoDubai(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "EQO_DUBAI", query);
  }

  @Post("eqo/dubai/jobs/:jobId/generate-bol")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  eqoDubaiGenerate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "EQO_DUBAI", jobId, actorId);
  }

  @Post("eqo/dubai/jobs/:jobId/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async eqoDubaiSubmit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    const generated = await this.ediService.generate(
      tenantId,
      "EQO_DUBAI",
      jobId,
      actorId,
    );
    return this.ediService.submit(tenantId, generated.id, actorId);
  }

  @Get("eqo/oman/jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  eqoOman(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "EQO_OMAN", query);
  }

  @Post("eqo/oman/jobs/:jobId/generate-bol")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  eqoOmanGenerate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "EQO_OMAN", jobId, actorId);
  }

  @Post("eqo/oman/jobs/:jobId/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async eqoOmanSubmit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    const generated = await this.ediService.generate(
      tenantId,
      "EQO_OMAN",
      jobId,
      actorId,
    );
    return this.ediService.submit(tenantId, generated.id, actorId);
  }

  @Get("ial/jobs")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_READ)
  ialJobs(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: EdiListQueryDto,
  ) {
    return this.ediService.listJobsForEdi(tenantId, "IAL", query);
  }

  @Post("ial/jobs/:jobId/generate")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  ialGenerate(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    return this.ediService.generate(tenantId, "IAL", jobId, actorId);
  }

  @Post("ial/jobs/:jobId/submit")
  @RequirePermissions(DOCUMENTATION_PERMISSIONS.EDI_SUBMIT)
  async ialSubmit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("jobId", ParseUUIDPipe) jobId: string,
  ) {
    const generated = await this.ediService.generate(
      tenantId,
      "IAL",
      jobId,
      actorId,
    );
    return this.ediService.submit(tenantId, generated.id, actorId);
  }
}

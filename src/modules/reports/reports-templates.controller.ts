import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { REPORTS_PERMISSIONS } from "./constants/reports-permission.constants";
import {
  ActivateTemplateDto,
  BindRendererDto,
} from "./dto/bind-renderer.dto";
import { ReportTemplatesQueryDto } from "./dto/report-templates-query.dto";
import { ReportsTemplatesService } from "./reports-templates.service";
import { ReportsSeedService } from "./seed/reports.seed";
import { RegistryEntry } from "./seed/fresa-registry.util";

@ApiTags("Reports — Catalog")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("reports/templates")
export class ReportsTemplatesController {
  constructor(
    private readonly service: ReportsTemplatesService,
    private readonly seed: ReportsSeedService,
  ) {}

  @Get()
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({
    summary: "List active report templates (paginated, tenant catalog)",
  })
  list(@Query() query: ReportTemplatesQueryDto) {
    return this.service.list(query);
  }

  @Get("renderers")
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({
    summary:
      "List implemented data-pack renderer_keys (for bind / activate). Not Jasper upload.",
  })
  listRenderers() {
    return this.service.listRenderers();
  }

  @Post("import")
  @RequirePermissions(REPORTS_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary:
      "Import FRESA registry entries (inactive unless pack-protected). Body: array or { templates: [] }",
  })
  @ApiBody({
    schema: {
      oneOf: [
        { type: "array", items: { type: "object" } },
        {
          type: "object",
          properties: {
            templates: { type: "array", items: { type: "object" } },
          },
        },
      ],
    },
  })
  async importRegistry(@Body() body: unknown) {
    const list = Array.isArray(body)
      ? body
      : ((body as { templates?: unknown[] })?.templates ?? []);
    const result = await this.seed.importRegistryEntries(
      list as RegistryEntry[],
    );
    return { success: true, ...result };
  }

  @Post(":code/bind-renderer")
  @RequirePermissions(REPORTS_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary:
      "Set a real renderer_key (clears pending.*). Optional activate=true for one-shot FE Activate.",
  })
  async bindRenderer(
    @Param("code") code: string,
    @Body() dto: BindRendererDto,
  ) {
    const row = await this.service.bindRenderer(code, dto);
    return {
      success: true,
      data: {
        id: row.id,
        code: row.code,
        is_active: row.is_active,
        renderer_key: row.renderer_key,
        formats: row.formats,
      },
    };
  }

  @Post(":code/activate")
  @RequirePermissions(REPORTS_PERMISSIONS.MANAGE)
  @ApiOperation({
    summary:
      "Activate template. If still pending.*, pass body.renderer_key to bind+activate.",
  })
  @ApiBody({ type: ActivateTemplateDto, required: false })
  async activate(
    @Param("code") code: string,
    @Body() dto: ActivateTemplateDto = {},
  ) {
    const row = await this.service.activate(code, dto);
    return {
      success: true,
      data: {
        id: row.id,
        code: row.code,
        is_active: row.is_active,
        renderer_key: row.renderer_key,
      },
    };
  }

  @Post(":code/deactivate")
  @RequirePermissions(REPORTS_PERMISSIONS.MANAGE)
  @ApiOperation({ summary: "Deactivate template (hide from default catalog list)" })
  async deactivate(@Param("code") code: string) {
    const row = await this.service.deactivate(code);
    return {
      success: true,
      data: {
        id: row.id,
        code: row.code,
        is_active: row.is_active,
      },
    };
  }

  @Get(":idOrCode")
  @RequirePermissions(REPORTS_PERMISSIONS.READ)
  @ApiOperation({
    summary:
      "Template detail + parameter schema (UUID or stable code). Returns inactive templates for FRESA browse.",
  })
  detail(
    @CurrentUser("tenantId") tenantId: string,
    @Param("idOrCode") idOrCode: string,
  ) {
    return this.service.getByIdOrCode(tenantId, idOrCode);
  }
}

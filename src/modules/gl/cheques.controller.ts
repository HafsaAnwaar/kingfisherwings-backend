import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { RolesGuard } from "../users/guards/roles.guard";
import { PermissionsGuard } from "../users/guards/permissions.guard";
import { RequirePermissions } from "../users/decorators/permissions.decorator";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { GL_PERMISSIONS } from "./constants/gl-permission.constants";
import { ChequesService } from "./cheques.service";
import {
  BounceChequeDto,
  ChequeQueryDto,
  CreateChequeDto,
  UpdateChequeDto,
} from "./dto/ar-ap.dto";

@ApiTags("GL — Cheques / PDC")
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller("gl/cheques")
export class ChequesController {
  constructor(private readonly service: ChequesService) {}

  @Get()
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "List cheques (receivable / payable / PDC)" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: ChequeQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get("reports/pdc-due")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "PDC due within N days (default 30)" })
  @ApiQuery({ name: "within_days", required: false, type: Number })
  pdcDue(
    @CurrentUser("tenantId") tenantId: string,
    @Query("within_days") withinDays?: string,
  ) {
    const days = withinDays ? Number(withinDays) : 30;
    return this.service.pdcDue(tenantId, Number.isFinite(days) ? days : 30);
  }

  @Get(":id")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Get cheque by id" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Register a cheque / PDC" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateChequeDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(":id")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Update a pending cheque" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateChequeDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Post(":id/deposit")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Mark cheque deposited" })
  deposit(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.deposit(tenantId, id, actorId);
  }

  @Post(":id/clear")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Mark cheque cleared" })
  clear(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.clear(tenantId, id, actorId);
  }

  @Post(":id/bounce")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Mark cheque bounced" })
  bounce(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: BounceChequeDto,
  ) {
    return this.service.bounce(tenantId, id, dto, actorId);
  }

  @Post(":id/cancel")
  @RequirePermissions(GL_PERMISSIONS.MANAGE_CHEQUES)
  @ApiOperation({ summary: "Cancel a cheque" })
  cancel(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.cancel(tenantId, id, actorId);
  }
}

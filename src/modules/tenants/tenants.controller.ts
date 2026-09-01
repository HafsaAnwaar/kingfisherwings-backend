import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { TenantsService } from "./tenants.service";

import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { TenantQueryDto } from "./dto/tenant-query.dto";

import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { CurrentSuperAdminUser } from "../auth/decorators/current-super-admin.decorator";
import { AllowSuperAdmin } from "../../common/decorators/allow-super-admin.decorator";

/**
 * Platform-admin-only: every route here requires a SuperAdmin token
 * (see POST /auth/super-admin/login). Tenant staff and tenant owners
 * never call this controller — they use /users/* and /auth/tenant-login.
 */
@ApiTags("Tenants (Super Admin)")
@ApiBearerAuth()
@AllowSuperAdmin()
@UseGuards(SuperAdminGuard)
@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // =====================================================
  // CREATE TENANT
  // =====================================================

  @Post()
  @ApiOperation({
    summary:
      "Create a new tenant (also provisions its TENANT_ADMIN owner user)",
  })
  @ApiResponse({
    status: 201,
    description: "Tenant created successfully.",
  })
  create(
    @Body()
    createTenantDto: CreateTenantDto,

    @CurrentSuperAdminUser("id")
    superAdminId: string,
  ) {
    return this.tenantsService.create(createTenantDto, superAdminId);
  }

  // =====================================================
  // GET ALL TENANTS
  // =====================================================

  @Get()
  @ApiOperation({
    summary: "Get all tenants",
  })
  findAll(
    @Query()
    query: TenantQueryDto,
  ) {
    return this.tenantsService.findAll(query);
  }

  // =====================================================
  // TENANT STATISTICS
  // =====================================================

  @Get("statistics")
  @ApiOperation({
    summary: "Tenant statistics",
  })
  statistics() {
    return this.tenantsService.statistics();
  }

  // =====================================================
  // SYNC PERMISSIONS
  // =====================================================

  @Post("sync-permissions")
  @ApiOperation({
    summary:
      "Reconcile ALL tenants against the current permission/role catalog — for tenants created before a later module added new permissions.",
  })
  syncPermissionsForAllTenants() {
    return this.tenantsService.syncPermissionsForAllTenants();
  }

  @Post(":id/sync-permissions")
  @ApiOperation({
    summary: "Reconcile one tenant against the current permission/role catalog",
  })
  syncPermissions(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.tenantsService.syncPermissions(id);
  }

  // =====================================================
  // GET SINGLE TENANT
  // =====================================================

  @Get(":id")
  @ApiOperation({
    summary: "Get tenant by ID",
  })
  findOne(
    @Param("id", new ParseUUIDPipe())
    id: string,
  ) {
    return this.tenantsService.findOne(id);
  }

  // =====================================================
  // UPDATE TENANT
  // =====================================================

  @Patch(":id")
  @ApiOperation({
    summary: "Update tenant",
  })
  update(
    @Param("id", new ParseUUIDPipe())
    id: string,

    @Body()
    dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(id, dto);
  }

  // =====================================================
  // DELETE TENANT
  // =====================================================

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Soft delete tenant",
  })
  @ApiResponse({ status: 204, description: "Tenant soft-deleted" })
  @ApiResponse({ status: 404, description: "Tenant not found" })
  async remove(
    @Param("id", new ParseUUIDPipe())
    id: string,
  ): Promise<void> {
    await this.tenantsService.remove(id);
  }

  // =====================================================
  // RESTORE TENANT
  // =====================================================

  @Patch(":id/restore")
  @ApiOperation({
    summary: "Restore tenant",
  })
  restore(
    @Param("id", new ParseUUIDPipe())
    id: string,
  ) {
    return this.tenantsService.restore(id);
  }

  // =====================================================
  // ACTIVATE TENANT
  // =====================================================

  @Patch(":id/activate")
  @ApiOperation({
    summary: "Activate tenant",
  })
  activate(
    @Param("id", new ParseUUIDPipe())
    id: string,
  ) {
    return this.tenantsService.activate(id);
  }

  // =====================================================
  // DEACTIVATE TENANT
  // =====================================================

  @Patch(":id/deactivate")
  @ApiOperation({
    summary: "Deactivate tenant",
  })
  deactivate(
    @Param("id", new ParseUUIDPipe())
    id: string,
  ) {
    return this.tenantsService.deactivate(id);
  }
}

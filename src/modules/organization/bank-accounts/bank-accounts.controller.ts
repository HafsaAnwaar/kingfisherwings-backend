import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";

import { BankAccountsService } from "./bank-accounts.service";
import {
  CreateTenantBankAccountDto,
  UpdateTenantBankAccountDto,
} from "../dto/tenant-bank-account.dto";
import { MasterQueryDto } from "../../masters/dto/master-query.dto";

import { RolesGuard } from "../../users/guards/roles.guard";
import { Roles } from "../../users/decorators/roles.decorator";
import { CurrentUser } from "../../users/decorators/current-user.decorator";

@ApiTags("Organization — Bank Accounts")
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN, UserRole.FINANCE_MANAGER)
@Controller("organization/bank-accounts")
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Get()
  @ApiOperation({ summary: "List this tenant's own bank accounts" })
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query() query: MasterQueryDto,
  ) {
    return this.service.findAll(tenantId, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a bank account by id" })
  findOne(
    @CurrentUser("tenantId") tenantId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: "Add a bank account" })
  create(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Body() dto: CreateTenantBankAccountDto,
  ) {
    return this.service.create(tenantId, { ...dto }, actorId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a bank account" })
  update(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantBankAccountDto,
  ) {
    return this.service.update(tenantId, id, { ...dto }, actorId);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Soft-delete a bank account" })
  async remove(
    @CurrentUser("tenantId") tenantId: string,
    @CurrentUser("id") actorId: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}

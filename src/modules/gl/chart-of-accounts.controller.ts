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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../users/guards/roles.guard';
import { PermissionsGuard } from '../users/guards/permissions.guard';
import { RequirePermissions } from '../users/decorators/permissions.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { GL_PERMISSIONS } from './constants/gl-permission.constants';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import {
  ChartOfAccountQueryDto,
  CreateChartOfAccountDto,
  LedgerQueryDto,
  TrialBalanceQueryDto,
  UpdateChartOfAccountDto,
} from './dto/gl.dto';

@ApiTags('GL — Chart of Accounts')
@ApiBearerAuth()
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('gl/accounts')
export class ChartOfAccountsController {
  constructor(private readonly service: ChartOfAccountsService) {}

  @Get()
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'List chart of accounts (Ch.17)' })
  findAll(@CurrentUser('tenantId') tenantId: string, @Query() query: ChartOfAccountQueryDto) {
    return this.service.findAll(tenantId, query);
  }

  @Get('tree')
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Hierarchical chart of accounts tree' })
  getTree(@CurrentUser('tenantId') tenantId: string) {
    return this.service.getTree(tenantId);
  }

  @Get('reports/trial-balance')
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Trial balance from posted voucher lines + opening balances' })
  trialBalance(@CurrentUser('tenantId') tenantId: string, @Query() query: TrialBalanceQueryDto) {
    return this.service.getTrialBalance(tenantId, query);
  }

  @Post('seed-defaults')
  @RequirePermissions(GL_PERMISSIONS.MANAGE_COA)
  @ApiOperation({ summary: 'Seed a starter freight COA (only when empty)' })
  seedDefaults(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') actorId: string) {
    return this.service.seedDefaults(tenantId, actorId);
  }

  @Get(':id')
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'Get account by id' })
  findOne(@CurrentUser('tenantId') tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/ledger')
  @RequirePermissions(GL_PERMISSIONS.VIEW)
  @ApiOperation({ summary: 'GL register for one account (posted vouchers)' })
  ledger(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: LedgerQueryDto,
  ) {
    return this.service.getLedger(tenantId, id, query);
  }

  @Post()
  @RequirePermissions(GL_PERMISSIONS.MANAGE_COA)
  @ApiOperation({ summary: 'Create a GL account' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: CreateChartOfAccountDto,
  ) {
    return this.service.create(tenantId, dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions(GL_PERMISSIONS.MANAGE_COA)
  @ApiOperation({ summary: 'Update a GL account' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChartOfAccountDto,
  ) {
    return this.service.update(tenantId, id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(GL_PERMISSIONS.MANAGE_COA)
  @ApiOperation({ summary: 'Soft-delete a GL account (blocked if used on voucher lines)' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') actorId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.service.softDelete(tenantId, id, actorId);
  }
}

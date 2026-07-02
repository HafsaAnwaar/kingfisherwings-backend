import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TenantsService } from './tenants.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';

@ApiTags('Tenants')
@ApiBearerAuth()
@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
  ) {}

  // =====================================================
  // CREATE TENANT
  // =====================================================

  
  @Post()
  @ApiOperation({
    summary: 'Create a new tenant (public — self-signup / bootstrap)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant created successfully.',
  })
  create(
    @Body()
    createTenantDto: CreateTenantDto,
  ) {
    return this.tenantsService.create(createTenantDto);
  }

  // =====================================================
  // GET ALL TENANTS
  // =====================================================

  @Get()
  @ApiOperation({
    summary: 'Get all tenants',
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

  @Get('statistics')
  @ApiOperation({
    summary: 'Tenant statistics',
  })
  statistics() {
    return this.tenantsService.statistics();
  }

  // =====================================================
  // GET SINGLE TENANT
  // =====================================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get tenant by ID',
  })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.tenantsService.findOne(id);
  }

  // =====================================================
  // UPDATE TENANT
  // =====================================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update tenant',
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,

    @Body()
    dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(
      id,
      dto,
    );
  }

  // =====================================================
  // DELETE TENANT
  // =====================================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete tenant',
  })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.tenantsService.remove(id);
  }

  // =====================================================
  // RESTORE TENANT
  // =====================================================

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore tenant',
  })
  restore(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.tenantsService.restore(id);
  }

  // =====================================================
  // ACTIVATE TENANT
  // =====================================================

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate tenant',
  })
  activate(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.tenantsService.activate(id);
  }

  // =====================================================
  // DEACTIVATE TENANT
  // =====================================================

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate tenant',
  })
  deactivate(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ) {
    return this.tenantsService.deactivate(id);
  }
}
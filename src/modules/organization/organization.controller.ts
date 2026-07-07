import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { OrganizationService } from './organization.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';

import { RolesGuard } from '../users/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@ApiTags('Organization Profile')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.TENANT_ADMIN)
@Controller('organization/profile')
export class OrganizationController {
  constructor(private readonly service: OrganizationService) {}

  @Get()
  @ApiOperation({ summary: "Get this tenant's own organization profile" })
  getProfile(@CurrentUser('tenantId') tenantId: string) {
    return this.service.getProfile(tenantId);
  }

  @Patch()
  @ApiOperation({ summary: "Update this tenant's own organization profile (Ch.27.1)" })
  updateProfile(
    @CurrentUser('tenantId') tenantId: string,
    @Body() dto: UpdateOrganizationProfileDto,
  ) {
    return this.service.updateProfile(tenantId, { ...dto });
  }
}

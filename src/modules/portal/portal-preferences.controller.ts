import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipStaffJwt } from '../../common/decorators/skip-staff-jwt.decorator';
import { CurrentPortal } from './decorators/portal.decorators';
import { UpdatePortalPreferencesDto } from './dto/portal-preferences.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalPreferencesService } from './portal-preferences.service';

@ApiTags('Portal Preferences')
@ApiBearerAuth()
@SkipStaffJwt()
@UseGuards(PortalAuthGuard)
@Controller('portal/preferences')
export class PortalPreferencesController {
  constructor(private readonly preferences: PortalPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my portal preferences (alerts + saved filters)' })
  get(@CurrentPortal() user: CurrentPortalUser) {
    return this.preferences.get(user);
  }

  @Put()
  @ApiOperation({ summary: 'Update my portal preferences (partial)' })
  update(@CurrentPortal() user: CurrentPortalUser, @Body() dto: UpdatePortalPreferencesDto) {
    return this.preferences.update(user, dto);
  }
}

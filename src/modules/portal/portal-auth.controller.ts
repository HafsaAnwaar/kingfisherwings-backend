import { Body, Controller, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorators';
import { CurrentPortal } from './decorators/portal.decorators';
import { PortalLoginDto, PortalRefreshDto } from './dto/portal.dto';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { CurrentPortalUser } from './interfaces/portal-auth.interfaces';
import { PortalService } from './portal.service';

@ApiTags('Portal Auth')
@Controller('portal/auth')
export class PortalAuthController {
  constructor(private readonly portal: PortalService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Customer portal login',
    description:
      'Public API for tenant websites. Requires tenant_slug + email + password issued by tenant staff after Get a Quote.',
  })
  login(
    @Body() dto: PortalLoginDto,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ip = forwardedFor?.split(',')[0]?.trim();
    return this.portal.login(dto, { ip, userAgent });
  }

  @Public()
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Refresh portal access token' })
  refresh(@Body() dto: PortalRefreshDto) {
    return this.portal.refresh(dto);
  }

  @Public()
  @UseGuards(PortalAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the current portal session' })
  logout(@CurrentPortal() user: CurrentPortalUser) {
    return this.portal.logout(user);
  }

  @Public()
  @UseGuards(PortalAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current portal user profile + party summary' })
  me(@CurrentPortal() user: CurrentPortalUser) {
    return this.portal.me(user);
  }
}

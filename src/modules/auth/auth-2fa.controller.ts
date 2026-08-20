import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { DisableTwoFactorDto, TotpVerifyDto } from './dto/invite-2fa.dto';

/**
 * Staff TOTP 2FA routes. Not registered on AuthModule while AUTH_2FA_LINKED is false.
 */
@ApiTags('Auth — 2FA (deferred)')
@ApiBearerAuth()
@Controller('auth')
export class AuthTwoFactorController {
  constructor(private readonly authService: AuthService) {}

  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate TOTP secret + QR for the current user' })
  setup2fa(@CurrentUser('tenantId') tenantId: string, @CurrentUser('id') userId: string) {
    return this.authService.setupTwoFactor(tenantId, userId);
  }

  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA after verifying a TOTP code from the authenticator app' })
  enable2fa(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TotpVerifyDto,
  ) {
    return this.authService.enableTwoFactor(tenantId, userId, dto);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA (password + optional TOTP/backup code)' })
  disable2fa(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: DisableTwoFactorDto,
  ) {
    return this.authService.disableTwoFactor(tenantId, userId, dto);
  }
}

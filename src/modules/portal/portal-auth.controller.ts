import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorators";
import { AUTH_THROTTLE } from "../../common/constants/auth-throttle.constants";
import { CurrentPortal } from "./decorators/portal.decorators";
import {
  AcceptPortalInviteDto,
  ChangePortalPasswordDto,
  PortalForgotPasswordDto,
  PortalLoginDto,
  PortalRefreshDto,
} from "./dto/portal.dto";
import { PortalOnboarding } from "./decorators/portal-onboarding.decorator";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalService } from "./portal.service";

@ApiTags("Portal Auth")
@Controller("portal/auth")
@PortalOnboarding("auth")
export class PortalAuthController {
  constructor(private readonly portal: PortalService) {}

  @Public()
  @Post("login")
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Customer portal login",
    description:
      "Rate limited: 3 attempts/min per user. Requires tenant_slug + email + password.",
  })
  login(
    @Body() dto: PortalLoginDto,
    @Headers("x-forwarded-for") forwardedFor?: string,
    @Headers("user-agent") userAgent?: string,
  ) {
    const ip = forwardedFor?.split(",")[0]?.trim();
    return this.portal.login(dto, { ip, userAgent });
  }

  @Public()
  @Post("forgot-password")
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @ApiOperation({
    summary: "Request a temporary portal password by email",
    description:
      "Rate limited: 3 attempts/min per user. Always returns success (no email enumeration).",
  })
  forgotPassword(@Body() dto: PortalForgotPasswordDto) {
    return this.portal.forgotPassword(dto);
  }

  @Public()
  @Post("accept-invite")
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Accept portal invite and set password",
    description: "Rate limited: 3 attempts/min per invite token.",
  })
  acceptInvite(@Body() dto: AcceptPortalInviteDto) {
    return this.portal.acceptInvite(dto);
  }

  @Public()
  @Post("refresh")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: "Refresh portal access token" })
  refresh(@Body() dto: PortalRefreshDto) {
    return this.portal.refresh(dto);
  }

  @Public()
  @UseGuards(PortalAuthGuard)
  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke the current portal session" })
  logout(@CurrentPortal() user: CurrentPortalUser) {
    return this.portal.logout(user);
  }

  @Public()
  @UseGuards(PortalAuthGuard)
  @Post("change-password")
  @HttpCode(200)
  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Change portal password",
    description:
      "Rate limited: 3 attempts/min. Required when must_change_password is true.",
  })
  changePassword(
    @CurrentPortal() user: CurrentPortalUser,
    @Body() dto: ChangePortalPasswordDto,
  ) {
    return this.portal.changePassword(user, dto);
  }

  @Public()
  @UseGuards(PortalAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current portal user profile + party summary" })
  me(@CurrentPortal() user: CurrentPortalUser) {
    return this.portal.me(user);
  }
}

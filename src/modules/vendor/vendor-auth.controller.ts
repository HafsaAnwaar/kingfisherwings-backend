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
import { CurrentVendor } from "./decorators/vendor.decorators";
import {
  AcceptVendorInviteDto,
  ChangeVendorPasswordDto,
  VendorForgotPasswordDto,
  VendorLoginDto,
  VendorRefreshDto,
} from "./dto/vendor-auth.dto";
import { VendorOnboarding } from "./decorators/vendor-onboarding.decorator";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorService } from "./vendor.service";

@ApiTags("Vendor Auth")
@Controller("vendor/auth")
@VendorOnboarding("auth")
export class VendorAuthController {
  constructor(private readonly vendor: VendorService) {}

  @Public()
  @Post("login")
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Vendor payment portal login",
    description: "Rate limited: 3 attempts/min per user (tenant + email).",
  })
  login(
    @Body() dto: VendorLoginDto,
    @Headers("x-forwarded-for") forwardedFor?: string,
    @Headers("user-agent") userAgent?: string,
  ) {
    const ip = forwardedFor?.split(",")[0]?.trim();
    return this.vendor.login(dto, { ip, userAgent });
  }

  @Public()
  @Post("forgot-password")
  @Throttle(AUTH_THROTTLE)
  @HttpCode(200)
  @ApiOperation({
    summary: "Request a temporary vendor password by email",
    description:
      "Rate limited: 3 attempts/min per user. Always returns success (no email enumeration).",
  })
  forgotPassword(@Body() dto: VendorForgotPasswordDto) {
    return this.vendor.forgotPassword(dto);
  }

  @Public()
  @Post("accept-invite")
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Accept vendor invite and set password",
    description: "Rate limited: 3 attempts/min per invite token.",
  })
  acceptInvite(@Body() dto: AcceptVendorInviteDto) {
    return this.vendor.acceptInvite(dto);
  }

  @Public()
  @Post("refresh")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: "Refresh vendor access token" })
  refresh(@Body() dto: VendorRefreshDto) {
    return this.vendor.refresh(dto);
  }

  @Public()
  @UseGuards(VendorAuthGuard)
  @Post("logout")
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke the current vendor session" })
  logout(@CurrentVendor() user: CurrentVendorUser) {
    return this.vendor.logout(user);
  }

  @Public()
  @UseGuards(VendorAuthGuard)
  @Post("change-password")
  @HttpCode(200)
  @ApiBearerAuth()
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({
    summary: "Change vendor password",
    description:
      "Rate limited: 3 attempts/min. Required when must_change_password is true.",
  })
  changePassword(
    @CurrentVendor() user: CurrentVendorUser,
    @Body() dto: ChangeVendorPasswordDto,
  ) {
    return this.vendor.changePassword(user, dto);
  }

  @Public()
  @UseGuards(VendorAuthGuard)
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current vendor user profile + party summary" })
  me(@CurrentVendor() user: CurrentVendorUser) {
    return this.vendor.me(user);
  }
}

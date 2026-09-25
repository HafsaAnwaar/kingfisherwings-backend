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
import { CurrentPortal } from "./decorators/portal.decorators";
import {
  AcceptPortalInviteDto,
  ChangePortalPasswordDto,
  PortalLoginDto,
  PortalRefreshDto,
} from "./dto/portal.dto";
import { PortalAuthGuard } from "./guards/portal-auth.guard";
import { CurrentPortalUser } from "./interfaces/portal-auth.interfaces";
import { PortalService } from "./portal.service";

@ApiTags("Portal Auth")
@Controller("portal/auth")
export class PortalAuthController {
  constructor(private readonly portal: PortalService) {}

  @Public()
  @Post("login")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: "Customer portal login",
    description:
      "Public API for tenant websites. Requires tenant_slug + email + password. After online-quote, credentials may be returned once; check must_change_password and call POST /portal/auth/change-password.",
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
  @Post("accept-invite")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: "Accept portal invite and set password",
    description:
      "Activates an INVITED portal user using the email invite token.",
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
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: "Change portal password",
    description:
      "Required when must_change_password is true (e.g. after online-quote temporary password).",
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

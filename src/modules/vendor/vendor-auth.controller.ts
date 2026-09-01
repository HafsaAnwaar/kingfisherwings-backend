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
import { CurrentVendor } from "./decorators/vendor.decorators";
import {
  AcceptVendorInviteDto,
  VendorLoginDto,
  VendorRefreshDto,
} from "./dto/vendor-auth.dto";
import { VendorAuthGuard } from "./guards/vendor-auth.guard";
import { CurrentVendorUser } from "./interfaces/vendor-auth.interfaces";
import { VendorService } from "./vendor.service";

@ApiTags("Vendor Auth")
@Controller("vendor/auth")
export class VendorAuthController {
  constructor(private readonly vendor: VendorService) {}

  @Public()
  @Post("login")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: "Vendor payment portal login" })
  login(
    @Body() dto: VendorLoginDto,
    @Headers("x-forwarded-for") forwardedFor?: string,
    @Headers("user-agent") userAgent?: string,
  ) {
    const ip = forwardedFor?.split(",")[0]?.trim();
    return this.vendor.login(dto, { ip, userAgent });
  }

  @Public()
  @Post("accept-invite")
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({ summary: "Accept vendor invite and set password" })
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
  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Current vendor user profile + party summary" })
  me(@CurrentVendor() user: CurrentVendorUser) {
    return this.vendor.me(user);
  }
}

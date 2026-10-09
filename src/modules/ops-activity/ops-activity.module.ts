import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../../prisma/prisma.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { PortalAuthGuard } from "../portal/guards/portal-auth.guard";
import { VendorAuthGuard } from "../vendor/guards/vendor-auth.guard";
import { OpsActivityController } from "./ops-activity.controller";
import { OpsActivityService } from "./ops-activity.service";
import { PortalOpsActivityController } from "./portal-ops-activity.controller";
import { VendorOpsActivityController } from "./vendor-ops-activity.controller";

@Module({
  imports: [PrismaModule, StorageModule, JwtModule.register({})],
  controllers: [
    OpsActivityController,
    PortalOpsActivityController,
    VendorOpsActivityController,
  ],
  providers: [OpsActivityService, PortalAuthGuard, VendorAuthGuard],
  exports: [OpsActivityService],
})
export class OpsActivityModule {}

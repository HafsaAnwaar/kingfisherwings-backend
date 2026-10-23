import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { GlModule } from "../gl/gl.module";
import { PartiesController } from "./parties.controller";
import { PartiesService } from "./parties.service";
import { PartyExtensionsService } from "./party-extensions.service";
import { PartyVerificationAdminController } from "./party-verification-admin.controller";
import { PartyVerificationService } from "./party-verification.service";

@Module({
  imports: [PrismaModule, GlModule, EmailModule, StorageModule],
  controllers: [PartiesController, PartyVerificationAdminController],
  providers: [PartiesService, PartyExtensionsService, PartyVerificationService],
  exports: [PartiesService, PartyExtensionsService, PartyVerificationService],
})
export class PartiesModule {}

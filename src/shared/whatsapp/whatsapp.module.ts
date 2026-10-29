import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppComposeService } from "./whatsapp-compose.service";
import { WhatsAppController } from "./whatsapp.controller";

@Module({
  imports: [PrismaModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WhatsAppComposeService],
  exports: [WhatsAppService, WhatsAppComposeService],
})
export class WhatsAppModule {}

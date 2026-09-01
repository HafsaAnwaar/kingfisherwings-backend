import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { WhatsAppService } from "./whatsapp.service";

@Module({
  imports: [EmailModule],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

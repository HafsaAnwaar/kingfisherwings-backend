import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppService } from './whatsapp.service';

@Module({
  imports: [PrismaModule, EmailModule],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}

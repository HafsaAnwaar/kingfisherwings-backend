import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import smtpConfig from '../../config/smtp.config';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule.forFeature(smtpConfig), PrismaModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import smtpConfig from "../../config/smtp.config";
import { PrismaModule } from "../../prisma/prisma.module";
import { PdfModule } from "../pdf/pdf.module";
import { DocumentEmailService } from "./document-email.service";
import { EmailService } from "./email.service";

@Module({
  imports: [ConfigModule.forFeature(smtpConfig), PrismaModule, PdfModule],
  providers: [EmailService, DocumentEmailService],
  exports: [EmailService, DocumentEmailService],
})
export class EmailModule {}

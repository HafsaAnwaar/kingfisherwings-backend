import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../shared/email/email.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [HealthController],
})
export class HealthModule {}

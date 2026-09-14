import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "../common/decorators/public.decorators";
import { EmailService } from "../shared/email/email.service";
import { StorageService } from "../shared/storage/storage.service";

@Public()
@Controller("health")
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private storage: StorageService,
  ) {}

  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      success: true,
      message: "Backend is running",
      database: "Connected",
      smtp: this.email.getSmtpStatus(),
      storage: this.storage.getStatus(),
    };
  }
}

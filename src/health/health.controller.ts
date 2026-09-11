import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Public } from "../common/decorators/public.decorators";
import { EmailService } from "../shared/email/email.service";

@Public()
@Controller("health")
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  @Get()
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      success: true,
      message: "Backend is running",
      database: "Connected",
      smtp: {
        configured: this.email.isConfigured(),
        host: this.config.get<string>("smtp.host") ?? null,
        from: this.config.get<string>("smtp.from") ?? null,
      },
    };
  }
}

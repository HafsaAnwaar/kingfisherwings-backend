import { Injectable } from "@nestjs/common";
import { JobType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { resolveJobDate } from "./utils/job-date.util";

@Injectable()
export class JobDateService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveForJob(
    tenantId: string,
    input: {
      job_type: JobType;
      etd?: Date | null;
      eta?: Date | null;
    },
  ): Promise<Date> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { job_date_source: true },
    });
    return resolveJobDate({
      job_date_source: tenant?.job_date_source ?? "SYSTEM_DATE",
      job_type: input.job_type,
      etd: input.etd,
      eta: input.eta,
    });
  }
}

import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import {
  REPORT_GENERATION_QUEUE,
  ReportGenerationJobPayload,
} from "../../shared/queue/queue.constants";
import { ReportsGenerateService } from "./reports-generate.service";

@Processor(REPORT_GENERATION_QUEUE)
export class ReportGenerationProcessor {
  private readonly logger = new Logger(ReportGenerationProcessor.name);

  constructor(private readonly generateService: ReportsGenerateService) {}

  @Process("generate")
  async handle(job: Job<ReportGenerationJobPayload>) {
    const { jobId, tenantId } = job.data;
    this.logger.log(`Processing report job ${jobId}`);
    await this.generateService.processJob(jobId, tenantId);
  }
}

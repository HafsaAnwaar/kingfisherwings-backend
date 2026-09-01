import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import { DocumentGenerationService } from "./document-generation.service";
import {
  DOCUMENT_GENERATION_QUEUE,
  DocumentGenerationJobPayload,
} from "./queue.constants";

@Processor(DOCUMENT_GENERATION_QUEUE)
export class DocumentGenerationProcessor {
  private readonly logger = new Logger(DocumentGenerationProcessor.name);

  constructor(private readonly documentGeneration: DocumentGenerationService) {}

  @Process()
  async handle(
    job: Job<DocumentGenerationJobPayload & { isOriginal?: boolean }>,
  ) {
    this.logger.log(
      `Processing document generation job ${job.id} (task=${job.data.taskId})`,
    );
    await this.documentGeneration.processTask(
      job.data.taskId,
      job.data.tenantId,
      job.data.isOriginal ?? false,
    );
  }
}

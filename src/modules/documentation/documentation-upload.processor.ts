import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Logger } from "@nestjs/common";
import {
  DOCUMENTATION_UPLOAD_QUEUE,
  DocumentationUploadJobPayload,
} from "../../shared/queue/queue.constants";
import { DocumentationUploadService } from "./documentation-upload.service";

@Processor(DOCUMENTATION_UPLOAD_QUEUE)
export class DocumentationUploadProcessor {
  private readonly logger = new Logger(DocumentationUploadProcessor.name);

  constructor(private readonly uploadService: DocumentationUploadService) {}

  @Process()
  async handle(job: Job<DocumentationUploadJobPayload>) {
    this.logger.log(
      `Processing documentation upload batch ${job.data.batchId}`,
    );
    await this.uploadService.processBatch(job.data.tenantId, job.data.batchId);
  }
}

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bull";
import { Prisma, ReportJobStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService } from "../../shared/storage/storage.service";
import { isRedisEnabledEnv } from "../../shared/redis/redis-options.util";
import {
  REPORT_GENERATION_QUEUE,
  ReportGenerationJobPayload,
} from "../../shared/queue/queue.constants";
import {
  DEFAULT_REPORT_MAX_CONCURRENT,
  REPORT_TTL_HOURS,
} from "./constants/reports.constants";
import { ReportGenerateDto } from "./dto/report-generate.dto";
import { ReportDataPackRegistry } from "./data-packs/report-data-pack.registry";
import { ReportRendererService } from "./renderers/report-renderer.service";
import { ReportsTemplatesService } from "./reports-templates.service";
import { ReportParamDef } from "./types/report.types";

@Injectable()
export class ReportsGenerateService {
  private readonly logger = new Logger(ReportsGenerateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: ReportsTemplatesService,
    private readonly dataPacks: ReportDataPackRegistry,
    private readonly renderer: ReportRendererService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
    @InjectQueue(REPORT_GENERATION_QUEUE)
    private readonly queue: Queue,
  ) {}

  async generate(
    tenantId: string,
    userId: string,
    dto: ReportGenerateDto,
  ) {
    if (!dto.template_id && !dto.code) {
      throw new BadRequestException("template_id or code is required");
    }

    const template = dto.template_id
      ? await this.templates.findTemplate(dto.template_id, true)
      : await this.templates.findTemplate(dto.code!, true);

    if (!template?.is_active) {
      throw new NotFoundException("Report template not found or inactive");
    }

    if (!template.formats.includes(dto.format)) {
      throw new BadRequestException(
        `Format ${dto.format} is not supported for ${template.code}`,
      );
    }

    this.validateParameters(
      template.parameters_schema,
      dto.parameters ?? {},
    );
    await this.validateContext(tenantId, dto.context);

    const maxConcurrent =
      this.config.get<number>("REPORT_MAX_CONCURRENT") ??
      Number(process.env.REPORT_MAX_CONCURRENT) ??
      DEFAULT_REPORT_MAX_CONCURRENT;

    const activeCount = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.count({
        where: {
          tenant_id: tenantId,
          status: { in: [ReportJobStatus.queued, ReportJobStatus.running] },
        },
      }),
    );

    if (activeCount >= maxConcurrent) {
      throw new HttpException(
        `Too many concurrent report jobs (max ${maxConcurrent}). Try again shortly.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.create({
        data: {
          tenant_id: tenantId,
          template_id: template.id,
          template_code: template.code,
          format: dto.format,
          status: ReportJobStatus.queued,
          parameters: (dto.parameters ?? {}) as Prisma.InputJsonValue,
          context: (dto.context ?? {}) as Prisma.InputJsonValue,
          requested_by: userId,
        },
      }),
    );

    await this.writeAudit(tenantId, userId, "REPORT_GENERATE", job.id, {
      template_code: template.code,
      format: dto.format,
      parameters: dto.parameters ?? {},
      context: dto.context ?? {},
    });

    const redisOn = isRedisEnabledEnv();
    if (!redisOn) {
      await this.processJob(job.id, tenantId);
      const refreshed = await this.prisma.reportJob.findFirst({
        where: { id: job.id, tenant_id: tenantId },
      });
      return {
        id: job.id,
        status: refreshed?.status ?? ReportJobStatus.ready,
        format: dto.format,
        template_code: template.code,
        download_url: refreshed?.download_url ?? null,
        expires_at: refreshed?.expires_at?.toISOString() ?? null,
        error: refreshed?.error ?? null,
      };
    }

    const bullJob = await this.queue.add(
      "generate",
      { jobId: job.id, tenantId } satisfies ReportGenerationJobPayload,
      { attempts: 2, removeOnComplete: true, removeOnFail: false },
    );

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.update({
        where: { id: job.id },
        data: { bull_job_id: String(bullJob.id) },
      }),
    );

    return {
      id: job.id,
      status: ReportJobStatus.queued,
      format: dto.format,
      template_code: template.code,
    };
  }

  async processJob(jobId: string, tenantId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.findFirst({
        where: { id: jobId, tenant_id: tenantId },
        include: { template: true },
      }),
    );
    if (!job) {
      this.logger.warn(`ReportJob ${jobId} not found`);
      return;
    }

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.reportJob.update({
        where: { id: jobId },
        data: {
          status: ReportJobStatus.running,
          started_at: new Date(),
          error: null,
        },
      }),
    );

    try {
      const parameters = (job.parameters ?? {}) as Record<string, unknown>;
      const context = (job.context ?? {}) as {
        job_id?: string;
        quotation_id?: string;
        invoice_id?: string;
        party_id?: string;
      };
      const dataset = await this.dataPacks.load(
        tenantId,
        job.template.renderer_key,
        parameters,
        context,
      );
      const rendered = await this.renderer.render(job.format, dataset);
      const fileName = `report-${job.template_code}-${jobId}.${rendered.extension}`;
      const stored = await this.storage.saveBuffer(
        tenantId,
        rendered.buffer,
        fileName,
        rendered.mimeType,
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + REPORT_TTL_HOURS);

      // Prefer API download route. When durable object storage is on, optionally
      // expose a short-lived presigned URL for direct browser download.
      let downloadUrl = `/reports/jobs/${jobId}/download`;
      try {
        if (stored.s3Key && this.storage.isDurable()) {
          downloadUrl = await this.storage.presignedGetUrl(stored.s3Key);
        }
      } catch {
        downloadUrl = `/reports/jobs/${jobId}/download`;
      }

      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.reportJob.update({
          where: { id: jobId },
          data: {
            status: ReportJobStatus.ready,
            file_url: stored.fileUrl,
            s3_key: stored.s3Key,
            file_name: fileName,
            file_size: stored.fileSize,
            mime_type: rendered.mimeType,
            download_url: downloadUrl,
            expires_at: expiresAt,
            completed_at: new Date(),
          },
        }),
      );

      await this.writeAudit(
        tenantId,
        job.requested_by,
        "REPORT_READY",
        jobId,
        { template_code: job.template_code, format: job.format },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`ReportJob ${jobId} failed: ${message}`);
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.reportJob.update({
          where: { id: jobId },
          data: {
            status: ReportJobStatus.failed,
            error: message,
            completed_at: new Date(),
          },
        }),
      );
      await this.writeAudit(
        tenantId,
        job.requested_by,
        "REPORT_FAILED",
        jobId,
        { template_code: job.template_code, error: message },
      );
    }
  }

  private validateParameters(
    schemaJson: Prisma.JsonValue,
    params: Record<string, unknown>,
  ) {
    const defs = (Array.isArray(schemaJson) ? schemaJson : []) as ReportParamDef[];
    for (const def of defs) {
      if (!def.required) continue;
      const val = params[def.name];
      if (val === undefined || val === null || val === "") {
        throw new BadRequestException(`Parameter "${def.name}" is required`);
      }
    }
  }

  private async validateContext(
    tenantId: string,
    context?: {
      job_id?: string;
      quotation_id?: string;
      invoice_id?: string;
      party_id?: string;
    },
  ) {
    if (!context) return;
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      if (context.job_id) {
        const job = await tx.job.findFirst({
          where: {
            id: context.job_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: { id: true },
        });
        if (!job) throw new BadRequestException("job_id not found in tenant");
      }
      if (context.quotation_id) {
        const q = await tx.quotation.findFirst({
          where: {
            id: context.quotation_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: { id: true },
        });
        if (!q) {
          throw new BadRequestException("quotation_id not found in tenant");
        }
      }
      if (context.invoice_id) {
        const inv = await tx.invoice.findFirst({
          where: {
            id: context.invoice_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: { id: true },
        });
        if (!inv) {
          throw new BadRequestException("invoice_id not found in tenant");
        }
      }
      if (context.party_id) {
        const party = await tx.party.findFirst({
          where: {
            id: context.party_id,
            tenant_id: tenantId,
            deleted_at: null,
          },
          select: { id: true },
        });
        if (!party) {
          throw new BadRequestException("party_id not found in tenant");
        }
      }
    });
  }

  private async writeAudit(
    tenantId: string,
    userId: string | null | undefined,
    action: string,
    entityId: string,
    metadata: Record<string, unknown>,
  ) {
    try {
      await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.auditLog.create({
          data: {
            tenant_id: tenantId,
            user_id: userId ?? null,
            action,
            entity: "ReportJob",
            entity_id: entityId,
            metadata: metadata as Prisma.InputJsonValue,
          },
        }),
      );
    } catch (err) {
      this.logger.warn(
        `AuditLog write failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentType, JobType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentGenerationService } from '../../shared/queue/document-generation.service';
import { EmailService } from '../../shared/email/email.service';
import { assertDocumentAllowedForJobType } from '../jobs/constants/job-document-allowlist';
import { markJobMilestoneIfPresent } from '../jobs/utils/mark-milestone.util';
import {
  GenerateJobDocumentDto,
  RecordNvoccMblReceivedDto,
  SendPreAlertDto,
} from './dto/nvocc-document.dto';

const NVOCC_JOB_TYPES: JobType[] = ['NVOCC_EXPORT', 'NVOCC_IMPORT'];

@Injectable()
export class NvoccDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentGeneration: DocumentGenerationService,
    private readonly emailService: EmailService,
  ) {}

  private async assertNvoccJob(tenantId: string, jobId: string) {
    const job = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findFirst({
        where: { id: jobId, tenant_id: tenantId, deleted_at: null },
        include: {
          nvocc_details: {
            include: {
              booking: true,
              voyage: true,
            },
          },
        },
      }),
    );

    if (!job) {
      throw new NotFoundException('Job not found.');
    }
    if (!NVOCC_JOB_TYPES.includes(job.job_type)) {
      throw new BadRequestException('Job is not an NVOCC job.');
    }
    if (!job.nvocc_details) {
      throw new BadRequestException('NVOCC job details are missing.');
    }

    return job;
  }

  async generateDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const job = await this.assertNvoccJob(tenantId, jobId);
    assertDocumentAllowedForJobType(job.job_type, documentType);

    const task = await this.documentGeneration.enqueueJobDocument(
      tenantId,
      jobId,
      documentType,
      actorId,
      dto.layout_variant,
      dto.is_original ?? false,
    );

    return {
      task_id: task.id,
      status: task.status,
      document_type: documentType,
      message: 'Document generation queued.',
    };
  }

  async generateHblDraft(tenantId: string, jobId: string, dto: GenerateJobDocumentDto, actorId?: string) {
    return this.generateDocument(tenantId, jobId, 'HBL', { ...dto, is_original: false }, actorId);
  }

  async generateHblOriginal(tenantId: string, jobId: string, dto: GenerateJobDocumentDto, actorId?: string) {
    const result = await this.generateDocument(
      tenantId,
      jobId,
      'HBL',
      { ...dto, is_original: true },
      actorId,
    );

    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccJobDetail.updateMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        data: {
          hbl_status: 'ORIGINAL',
          hbl_issued_date: new Date(),
          updated_by: actorId,
        },
      });
      await markJobMilestoneIfPresent(tx, tenantId, jobId, 'HBL_ISSUED', new Date(), actorId);
    });

    return result;
  }

  async generateSurrenderNotice(
    tenantId: string,
    jobId: string,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const result = await this.generateDocument(tenantId, jobId, 'SURRENDER_NOTICE', dto, actorId);

    await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.nvoccJobDetail.updateMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        data: { hbl_status: 'SURRENDERED', updated_by: actorId },
      }),
    );

    return result;
  }

  async generateImportDocument(
    tenantId: string,
    jobId: string,
    documentType: DocumentType,
    dto: GenerateJobDocumentDto,
    actorId?: string,
  ) {
    const result = await this.generateDocument(tenantId, jobId, documentType, dto, actorId);
    const now = new Date();

    if (documentType === 'CAN') {
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        await tx.nvoccJobDetail.updateMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          data: { can_sent_at: now, updated_by: actorId },
        });
        await markJobMilestoneIfPresent(tx, tenantId, jobId, 'CAN_SENT', now, actorId);
      });
    } else if (documentType === 'DELIVERY_ORDER') {
      await this.prisma.runWithTenant(tenantId, async (tx) => {
        await tx.nvoccJobDetail.updateMany({
          where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
          data: { do_issued_at: now, updated_by: actorId },
        });
        await markJobMilestoneIfPresent(tx, tenantId, jobId, 'DO_ISSUED', now, actorId);
      });
    }

    return result;
  }

  async recordMblReceived(
    tenantId: string,
    jobId: string,
    dto: RecordNvoccMblReceivedDto,
    actorId?: string,
  ) {
    const job = await this.assertNvoccJob(tenantId, jobId);
    const mblNumber = dto.mbl_number ?? job.nvocc_details!.mbl_number ?? job.nvocc_details!.voyage?.mbl_number;

    if (!mblNumber) {
      throw new BadRequestException('MBL number is required.');
    }

    const now = new Date();
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccJobDetail.updateMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        data: { mbl_number: mblNumber, mbl_received_date: now, updated_by: actorId },
      });
      await markJobMilestoneIfPresent(tx, tenantId, jobId, 'MBL_RECEIVED', now, actorId);
    });

    return { job_id: jobId, mbl_number: mblNumber, mbl_received_date: now };
  }

  async sendPreAlert(tenantId: string, jobId: string, dto: SendPreAlertDto, actorId?: string) {
    const job = await this.assertNvoccJob(tenantId, jobId);
    const detail = job.nvocc_details!;
    const voyage = detail.voyage;
    const booking = detail.booking;

    const prepared = await this.prisma.runWithTenant(tenantId, async (tx) => {
      const milestone = await tx.jobMilestone.findFirst({
        where: { tenant_id: tenantId, job_id: jobId, milestone: 'PRE_ALERT_SENT', deleted_at: null },
      });
      if (!milestone) {
        throw new NotFoundException('PRE_ALERT_SENT milestone not found on this job.');
      }

      const subject = `Pre-Alert — ${job.job_number}`;
      const body =
        dto.message ??
        `<p>Pre-alert for NVOCC job <strong>${job.job_number}</strong>.</p>` +
          (detail.hbl_number ? `<p>HBL: ${detail.hbl_number}</p>` : '') +
          (detail.mbl_number ? `<p>MBL: ${detail.mbl_number}</p>` : '') +
          (voyage?.voyage_number ? `<p>Voyage: ${voyage.voyage_number}</p>` : '') +
          (booking?.commodity ? `<p>Commodity: ${booking.commodity}</p>` : '') +
          (job.commodity ? `<p>Commodity: ${job.commodity}</p>` : '');

      return { milestone, subject, body };
    });

    const emailLog = await this.emailService.send({
      tenantId,
      eventType: 'PRE_ALERT',
      to: dto.to_email,
      subject: prepared.subject,
      body: prepared.body,
      jobId,
      createdBy: actorId,
    });

    const now = new Date();
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      if (!prepared.milestone.actual_date) {
        await tx.jobMilestone.update({
          where: { id: prepared.milestone.id },
          data: {
            actual_date: now,
            completed_by: actorId,
            notes: dto.message ?? prepared.milestone.notes,
            updated_by: actorId,
          },
        });
      }
      await tx.nvoccJobDetail.updateMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        data: { pre_alert_sent_at: now, updated_by: actorId },
      });
    });

    return {
      success: emailLog.status === 'SENT',
      email_log_id: emailLog.id,
      status: emailLog.status,
      job_id: jobId,
      to_email: dto.to_email,
      milestone: 'PRE_ALERT_SENT',
    };
  }

  async submitSi(tenantId: string, jobId: string, actorId?: string) {
    await this.assertNvoccJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      markJobMilestoneIfPresent(tx, tenantId, jobId, 'SI_SUBMITTED', new Date(), actorId),
    );
    return { job_id: jobId, milestone: 'SI_SUBMITTED' };
  }

  async submitVgm(tenantId: string, jobId: string, actorId?: string) {
    await this.assertNvoccJob(tenantId, jobId);
    await this.prisma.runWithTenant(tenantId, (tx) =>
      markJobMilestoneIfPresent(tx, tenantId, jobId, 'VGM_SUBMITTED', new Date(), actorId),
    );
    return { job_id: jobId, milestone: 'VGM_SUBMITTED' };
  }

  async recordPodReceived(tenantId: string, jobId: string, actorId?: string) {
    await this.assertNvoccJob(tenantId, jobId);
    const now = new Date();
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      await tx.nvoccJobDetail.updateMany({
        where: { tenant_id: tenantId, job_id: jobId, deleted_at: null },
        data: { pod_received_at: now, updated_by: actorId },
      });
      await markJobMilestoneIfPresent(tx, tenantId, jobId, 'POD_RECEIVED', now, actorId);
    });
    return { job_id: jobId, milestone: 'POD_RECEIVED', pod_received_at: now };
  }

  async getGenerationStatus(tenantId: string, jobId: string) {
    await this.assertNvoccJob(tenantId, jobId);
    return this.documentGeneration.listTasks(tenantId, { jobId });
  }
}

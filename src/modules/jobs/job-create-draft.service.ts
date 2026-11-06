import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UpsertJobCreateDraftDto } from "./dto/job-create-draft.dto";

const MAX_PAYLOAD_CHARS = 512_000;

@Injectable()
export class JobCreateDraftService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, userId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const rows = await tx.jobCreateDraft.findMany({
        where: { tenant_id: tenantId, user_id: userId, deleted_at: null },
        orderBy: { updated_at: "desc" },
        take: 20,
      });
      return { success: true, data: rows };
    });
  }

  async getCurrent(tenantId: string, userId: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.jobCreateDraft.findFirst({
        where: { tenant_id: tenantId, user_id: userId, deleted_at: null },
        orderBy: { updated_at: "desc" },
      });
      return { success: true, data: row };
    });
  }

  async getOne(tenantId: string, userId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const row = await tx.jobCreateDraft.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
        },
      });
      if (!row) throw new NotFoundException("Draft not found.");
      return { success: true, data: row };
    });
  }

  async upsertCurrent(
    tenantId: string,
    userId: string,
    dto: UpsertJobCreateDraftDto,
  ) {
    this.assertPayloadSize(dto.payload);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCreateDraft.findFirst({
        where: { tenant_id: tenantId, user_id: userId, deleted_at: null },
        orderBy: { updated_at: "desc" },
      });
      if (existing) {
        const row = await tx.jobCreateDraft.update({
          where: { id: existing.id },
          data: {
            ...(dto.job_type !== undefined ? { job_type: dto.job_type } : {}),
            ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
            ...(dto.step !== undefined ? { step: dto.step } : {}),
            ...(dto.payload !== undefined
              ? { payload: dto.payload as Prisma.InputJsonValue }
              : {}),
          },
        });
        return { success: true, data: row };
      }
      const row = await tx.jobCreateDraft.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          branch_id: dto.branch_id,
          job_type: dto.job_type,
          step: dto.step,
          payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
        },
      });
      return { success: true, data: row };
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    dto: UpsertJobCreateDraftDto,
  ) {
    this.assertPayloadSize(dto.payload);
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCreateDraft.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Draft not found.");
      const row = await tx.jobCreateDraft.update({
        where: { id },
        data: {
          ...(dto.job_type !== undefined ? { job_type: dto.job_type } : {}),
          ...(dto.branch_id !== undefined ? { branch_id: dto.branch_id } : {}),
          ...(dto.step !== undefined ? { step: dto.step } : {}),
          ...(dto.payload !== undefined
            ? { payload: dto.payload as Prisma.InputJsonValue }
            : {}),
        },
      });
      return { success: true, data: row };
    });
  }

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.jobCreateDraft.findFirst({
        where: {
          id,
          tenant_id: tenantId,
          user_id: userId,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException("Draft not found.");
      await tx.jobCreateDraft.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      return { success: true, data: { id, deleted: true } };
    });
  }

  private assertPayloadSize(payload?: Record<string, unknown>) {
    if (payload === undefined) return;
    const size = JSON.stringify(payload).length;
    if (size > MAX_PAYLOAD_CHARS) {
      throw new BadRequestException(
        `Draft payload too large (${size} chars; max ${MAX_PAYLOAD_CHARS}).`,
      );
    }
  }
}

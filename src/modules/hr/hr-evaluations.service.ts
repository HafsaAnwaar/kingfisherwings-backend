import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HrEvaluationStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import {
  CycleDto,
  EvaluationDto,
  SubmitScoresDto,
  TemplateDto,
  UpdateTemplateDto,
} from './dto/hr-evaluation.dto';

@Injectable()
export class HrEvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTemplate(user: CurrentUser, dto: TemplateDto) {
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluationTemplate.create({
        data: {
          tenant_id: user.tenantId,
          name: dto.name.trim(),
          kpis: dto.kpis as Prisma.InputJsonValue,
          created_by: user.id,
        },
      }),
    );
    return { success: true, data: row };
  }

  async listTemplates(user: CurrentUser) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluationTemplate.findMany({
        where: { tenant_id: user.tenantId, deleted_at: null },
        orderBy: { name: 'asc' },
      }),
    );
    return { success: true, data };
  }

  async updateTemplate(user: CurrentUser, id: string, dto: UpdateTemplateDto) {
    await this.requireTemplate(user.tenantId, id);
    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluationTemplate.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.kpis !== undefined ? { kpis: dto.kpis as Prisma.InputJsonValue } : {}),
        },
      }),
    );
    return { success: true, data: updated };
  }

  async createCycle(user: CurrentUser, dto: CycleDto) {
    await this.requireTemplate(user.tenantId, dto.template_id);
    const cycle = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluationCycle.create({
        data: {
          tenant_id: user.tenantId,
          template_id: dto.template_id,
          name: dto.name.trim(),
          year: dto.year,
          start_date: new Date(dto.start_date),
          end_date: new Date(dto.end_date),
          created_by: user.id,
        },
        include: { template: { select: { id: true, name: true } } },
      }),
    );
    return { success: true, data: cycle };
  }

  async listCycles(user: CurrentUser, year?: number) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluationCycle.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(year ? { year } : {}),
        },
        orderBy: { start_date: 'desc' },
        include: { template: { select: { id: true, name: true } } },
      }),
    );
    return { success: true, data };
  }

  async createEvaluation(user: CurrentUser, dto: EvaluationDto) {
    await this.requireCycle(user.tenantId, dto.cycle_id);
    const row = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluation.create({
        data: {
          tenant_id: user.tenantId,
          cycle_id: dto.cycle_id,
          employee_id: dto.employee_id,
          status: 'DRAFT',
          created_by: user.id,
        },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
          cycle: { select: { id: true, name: true, year: true } },
        },
      }),
    );
    return { success: true, data: row };
  }

  async listEvaluations(user: CurrentUser, cycleId?: string, employeeId?: string) {
    const data = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluation.findMany({
        where: {
          tenant_id: user.tenantId,
          deleted_at: null,
          ...(cycleId ? { cycle_id: cycleId } : {}),
          ...(employeeId ? { employee_id: employeeId } : {}),
        },
        include: {
          employee: { select: { id: true, employee_code: true, first_name: true, last_name: true } },
          cycle: { select: { id: true, name: true, year: true } },
        },
      }),
    );
    return { success: true, data };
  }

  async submitSelf(user: CurrentUser, id: string, dto: SubmitScoresDto) {
    const evalRow = await this.requireEvaluation(user.tenantId, id);
    if (evalRow.status !== 'DRAFT') {
      throw new BadRequestException('Evaluation is not open for self submission.');
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluation.update({
        where: { id },
        data: {
          self_scores: dto.scores as Prisma.InputJsonValue,
          self_comments: dto.comments ?? null,
          promotion_recommended: dto.promotion_recommended ?? false,
          status: 'SELF_SUBMITTED',
        },
      }),
    );
    return { success: true, data: updated };
  }

  async submitManager(user: CurrentUser, id: string, dto: SubmitScoresDto) {
    const evalRow = await this.requireEvaluation(user.tenantId, id);
    if (!['DRAFT', 'SELF_SUBMITTED', 'MANAGER_SUBMITTED'].includes(evalRow.status)) {
      throw new BadRequestException('Evaluation is not open for manager review.');
    }

    const updated = await this.prisma.runWithTenant(user.tenantId, (tx) =>
      tx.hrEvaluation.update({
        where: { id },
        data: {
          manager_scores: dto.scores as Prisma.InputJsonValue,
          manager_comments: dto.comments ?? null,
          promotion_recommended: dto.promotion_recommended ?? evalRow.promotion_recommended,
          status: 'MANAGER_SUBMITTED',
        },
      }),
    );
    return { success: true, data: updated };
  }

  async finalize(user: CurrentUser, id: string) {
    const evalRow = await this.requireEvaluation(user.tenantId, id);
    if (evalRow.status !== 'MANAGER_SUBMITTED') {
      throw new BadRequestException('Evaluation must be manager-submitted before finalization.');
    }

    const selfScores = (evalRow.self_scores as Record<string, number> | null) ?? {};
    const mgrScores = (evalRow.manager_scores as Record<string, number> | null) ?? {};
    const keys = new Set([...Object.keys(selfScores), ...Object.keys(mgrScores)]);
    let total = 0;
    let count = 0;
    for (const key of keys) {
      const self = selfScores[key];
      const mgr = mgrScores[key];
      if (self !== undefined && mgr !== undefined) {
        total += (Number(self) + Number(mgr)) / 2;
        count += 1;
      } else if (mgr !== undefined) {
        total += Number(mgr);
        count += 1;
      } else if (self !== undefined) {
        total += Number(self);
        count += 1;
      }
    }
    const finalScore = count > 0 ? Number((total / count).toFixed(2)) : null;

    const updated = await this.prisma.runWithTenant(user.tenantId, async (tx) => {
      const row = await tx.hrEvaluation.update({
        where: { id },
        data: { final_score: finalScore, status: 'FINALIZED' },
      });

      if (finalScore !== null) {
        await tx.hrEmployee.update({
          where: { id: evalRow.employee_id },
          data: { performance_evaluation_score: finalScore, updated_by: user.id },
        });
      }

      return row;
    });

    return { success: true, data: updated };
  }

  private async requireTemplate(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEvaluationTemplate.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!row) throw new NotFoundException('Evaluation template not found.');
    return row;
  }

  private async requireCycle(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEvaluationCycle.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!row) throw new NotFoundException('Evaluation cycle not found.');
    return row;
  }

  private async requireEvaluation(tenantId: string, id: string) {
    const row = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.hrEvaluation.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } }),
    );
    if (!row) throw new NotFoundException('Evaluation not found.');
    return row;
  }
}

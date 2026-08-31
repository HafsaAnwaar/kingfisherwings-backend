import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { BulkCostBatchDto } from './dto/documentation-bulk-cost.dto';

@Injectable()
export class DocumentationBulkCostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  async preview(tenantId: string, dto: BulkCostBatchDto) {
    const lines = dto.lines.map((line) => {
      const exchangeRate = line.exchange_rate ?? 1;
      const amountAed = Number(line.fcy_amount) * exchangeRate;
      return {
        ...line,
        exchange_rate: exchangeRate,
        amount_aed: amountAed,
        valid: amountAed > 0,
      };
    });

    const invalid = lines.filter((l) => !l.valid);
    if (invalid.length) {
      throw new BadRequestException(`${invalid.length} line(s) have invalid amounts.`);
    }

    return {
      header: {
        organization_id: dto.organization_id,
        vessel_id: dto.vessel_id,
        voyage_number: dto.voyage_number,
        prorate_method: dto.prorate_method,
      },
      lines,
      total_aed: lines.reduce((sum, l) => sum + l.amount_aed, 0),
    };
  }

  async submit(tenantId: string, dto: BulkCostBatchDto, actorId?: string) {
    await this.preview(tenantId, dto);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const batch = await tx.documentationBulkCostBatch.create({
        data: {
          tenant_id: tenantId,
          organization_id: dto.organization_id,
          vessel_id: dto.vessel_id,
          voyage_number: dto.voyage_number,
          prorate_method: dto.prorate_method,
          status: 'SUBMITTED',
          submitted_at: new Date(),
          created_by: actorId,
          updated_by: actorId,
          lines: {
            create: dto.lines.map((line) => {
              const exchangeRate = line.exchange_rate ?? 1;
              return {
                tenant_id: tenantId,
                job_id: line.job_id,
                charge_code_id: line.charge_code_id,
                description: line.description,
                currency_code: line.currency_code,
                exchange_rate: exchangeRate,
                fcy_amount: line.fcy_amount,
                amount_aed: Number(line.fcy_amount) * exchangeRate,
                sale_or_cost: line.sale_or_cost ?? 'COST',
                dr_cr: line.dr_cr ?? 'Dr',
                tax_group_id: line.tax_group_id,
              };
            }),
          },
        },
        include: { lines: true },
      });

      for (const line of batch.lines) {
        if (!line.charge_code_id) continue;
        await this.jobsService.addCharge(
          tenantId,
          line.job_id,
          {
            charge_code_id: line.charge_code_id,
            description: line.description,
            unit_price: Number(line.fcy_amount),
            currency_code: line.currency_code,
            exchange_rate: Number(line.exchange_rate),
            is_cost: line.sale_or_cost === 'COST',
          },
          actorId,
        );
      }

      return batch;
    });
  }

  async findOne(tenantId: string, id: string) {
    const batch = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.documentationBulkCostBatch.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: { lines: true },
      }),
    );
    if (!batch) throw new NotFoundException('Bulk cost batch not found.');
    return batch;
  }
}

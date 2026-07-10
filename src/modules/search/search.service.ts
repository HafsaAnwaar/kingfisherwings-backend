import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseSearchTypes, SearchQueryDto } from './dto/search-query.dto';

export interface SearchResultItem {
  entity_type: 'job' | 'quotation' | 'party';
  id: string;
  title: string;
  subtitle?: string;
  reference?: string;
  status?: string;
  matched_field?: string;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(tenantId: string, query: SearchQueryDto) {
    const term = query.q.trim();
    const limit = query.limit ?? 20;
    const types = parseSearchTypes(query.types);
    const perTypeLimit = Math.ceil(limit / types.length);

    const results: SearchResultItem[] = [];

    if (types.includes('jobs')) {
      const jobs = await this.searchJobs(tenantId, term, perTypeLimit);
      results.push(...jobs);
    }

    if (types.includes('quotations')) {
      const quotations = await this.searchQuotations(tenantId, term, perTypeLimit);
      results.push(...quotations);
    }

    if (types.includes('parties')) {
      const parties = await this.searchParties(tenantId, term, perTypeLimit);
      results.push(...parties);
    }

    return {
      query: term,
      total: results.length,
      results: results.slice(0, limit),
    };
  }

  private async searchJobs(tenantId: string, term: string, limit: number): Promise<SearchResultItem[]> {
    const where: Prisma.JobWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      OR: [
        { job_number: { contains: term, mode: 'insensitive' } },
        { commodity: { contains: term, mode: 'insensitive' } },
        { notes: { contains: term, mode: 'insensitive' } },
        { customer_remarks: { contains: term, mode: 'insensitive' } },
        { hs_code: { contains: term, mode: 'insensitive' } },
        { air_details: { hawb_number: { contains: term, mode: 'insensitive' } } },
        { air_details: { mawb_number: { contains: term, mode: 'insensitive' } } },
        { sea_fcl_details: { hbl_number: { contains: term, mode: 'insensitive' } } },
        { sea_fcl_details: { mbl_number: { contains: term, mode: 'insensitive' } } },
        { sea_fcl_details: { booking_number: { contains: term, mode: 'insensitive' } } },
      ],
    };

    const jobs = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.job.findMany({
        where,
        select: {
          id: true,
          job_number: true,
          job_type: true,
          status: true,
          commodity: true,
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    );

    return jobs.map((j) => ({
      entity_type: 'job' as const,
      id: j.id,
      title: j.job_number,
      subtitle: j.commodity ?? undefined,
      reference: j.job_type,
      status: j.status,
    }));
  }

  private async searchQuotations(tenantId: string, term: string, limit: number): Promise<SearchResultItem[]> {
    const quotations = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { quotation_number: { contains: term, mode: 'insensitive' } },
            { commodity: { contains: term, mode: 'insensitive' } },
            { remarks: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          quotation_number: true,
          status: true,
          job_type: true,
          commodity: true,
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    );

    return quotations.map((q) => ({
      entity_type: 'quotation' as const,
      id: q.id,
      title: q.quotation_number,
      subtitle: q.commodity ?? undefined,
      reference: q.job_type,
      status: q.status,
    }));
  }

  private async searchParties(tenantId: string, term: string, limit: number): Promise<SearchResultItem[]> {
    const parties = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { code: { contains: term, mode: 'insensitive' } },
            { short_name: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
            { vat_number: { contains: term, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          code: true,
          party_type: true,
          email: true,
        },
        take: limit,
        orderBy: { name: 'asc' },
      }),
    );

    return parties.map((p) => ({
      entity_type: 'party' as const,
      id: p.id,
      title: p.name,
      subtitle: p.email ?? undefined,
      reference: p.code ?? p.party_type,
    }));
  }
}

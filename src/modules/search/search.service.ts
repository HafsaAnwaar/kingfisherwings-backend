import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { parseSearchTypes, SearchQueryDto } from './dto/search-query.dto';

export interface SearchResultItem {
  entity_type: 'job' | 'quotation' | 'party' | 'invoice';
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
    const perTypeLimit = Math.ceil(limit / Math.max(types.length, 1));

    const results: SearchResultItem[] = [];

    if (types.includes('jobs')) {
      results.push(...(await this.searchJobs(tenantId, term, perTypeLimit, query)));
    }
    if (types.includes('quotations')) {
      results.push(...(await this.searchQuotations(tenantId, term, perTypeLimit, query)));
    }
    if (types.includes('parties')) {
      results.push(...(await this.searchParties(tenantId, term, perTypeLimit, query)));
    }
    if (types.includes('invoices')) {
      results.push(...(await this.searchInvoices(tenantId, term, perTypeLimit, query)));
    }

    return {
      query: term,
      filters_applied: this.summarizeFilters(query),
      total: results.length,
      results: results.slice(0, limit),
    };
  }

  private summarizeFilters(query: SearchQueryDto) {
    const keys = [
      'party_id', 'customer_id', 'shipper_id', 'consignee_id', 'job_type', 'status',
      'origin_port_id', 'dest_port_id', 'hawb_number', 'mawb_number', 'hbl_number',
      'mbl_number', 'booking_number', 'container_number', 'invoice_number',
      'quotation_number', 'etd_from', 'etd_to', 'eta_from', 'eta_to',
      'created_from', 'created_to', 'salesperson_id', 'branch_id', 'hs_code',
    ] as const;
    return keys.filter((k) => query[k] != null && query[k] !== '');
  }

  private async searchJobs(
    tenantId: string,
    term: string,
    limit: number,
    query: SearchQueryDto,
  ): Promise<SearchResultItem[]> {
    const where: Prisma.JobWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      AND: [
        {
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
            {
              sea_fcl_details: {
                containers: { some: { container_number: { contains: term, mode: 'insensitive' } } },
              },
            },
          ],
        },
        ...(query.job_type ? [{ job_type: query.job_type as never }] : []),
        ...(query.status ? [{ status: query.status as never }] : []),
        ...(query.shipper_id || query.party_id
          ? [{ shipper_id: query.shipper_id ?? query.party_id }]
          : []),
        ...(query.consignee_id ? [{ consignee_id: query.consignee_id }] : []),
        ...(query.origin_port_id ? [{ origin_port_id: query.origin_port_id }] : []),
        ...(query.dest_port_id ? [{ dest_port_id: query.dest_port_id }] : []),
        ...(query.salesperson_id ? [{ salesperson_id: query.salesperson_id }] : []),
        ...(query.branch_id ? [{ branch_id: query.branch_id }] : []),
        ...(query.hs_code ? [{ hs_code: { contains: query.hs_code, mode: 'insensitive' as const } }] : []),
        ...(query.hawb_number
          ? [{ air_details: { hawb_number: { contains: query.hawb_number, mode: 'insensitive' as const } } }]
          : []),
        ...(query.mawb_number
          ? [{ air_details: { mawb_number: { contains: query.mawb_number, mode: 'insensitive' as const } } }]
          : []),
        ...(query.hbl_number
          ? [{ sea_fcl_details: { hbl_number: { contains: query.hbl_number, mode: 'insensitive' as const } } }]
          : []),
        ...(query.mbl_number
          ? [{ sea_fcl_details: { mbl_number: { contains: query.mbl_number, mode: 'insensitive' as const } } }]
          : []),
        ...(query.booking_number
          ? [{ sea_fcl_details: { booking_number: { contains: query.booking_number, mode: 'insensitive' as const } } }]
          : []),
        ...(query.container_number
          ? [{
              sea_fcl_details: {
                containers: {
                  some: { container_number: { contains: query.container_number, mode: 'insensitive' as const } },
                },
              },
            }]
          : []),
        ...(query.etd_from || query.etd_to
          ? [{
              etd: {
                ...(query.etd_from ? { gte: new Date(query.etd_from) } : {}),
                ...(query.etd_to ? { lte: new Date(query.etd_to) } : {}),
              },
            }]
          : []),
        ...(query.eta_from || query.eta_to
          ? [{
              eta: {
                ...(query.eta_from ? { gte: new Date(query.eta_from) } : {}),
                ...(query.eta_to ? { lte: new Date(query.eta_to) } : {}),
              },
            }]
          : []),
        ...(query.created_from || query.created_to
          ? [{
              created_at: {
                ...(query.created_from ? { gte: new Date(query.created_from) } : {}),
                ...(query.created_to ? { lte: new Date(query.created_to) } : {}),
              },
            }]
          : []),
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
          shipper_id: true,
          consignee_id: true,
          air_details: { select: { hawb_number: true, mawb_number: true } },
          sea_fcl_details: { select: { hbl_number: true, mbl_number: true, booking_number: true } },
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    );

    const partyIds = [
      ...new Set(
        jobs.flatMap((j) => [j.shipper_id, j.consignee_id].filter((id): id is string => Boolean(id))),
      ),
    ];
    const parties =
      partyIds.length === 0
        ? []
        : await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.party.findMany({
              where: { tenant_id: tenantId, id: { in: partyIds }, deleted_at: null },
              select: { id: true, name: true },
            }),
          );
    const partyNameById = new Map(parties.map((p) => [p.id, p.name]));

    return jobs.map((j) => {
      const partyName =
        (j.shipper_id && partyNameById.get(j.shipper_id)) ||
        (j.consignee_id && partyNameById.get(j.consignee_id));
      const docRef =
        j.air_details?.hawb_number ??
        j.air_details?.mawb_number ??
        j.sea_fcl_details?.hbl_number ??
        j.sea_fcl_details?.mbl_number ??
        j.sea_fcl_details?.booking_number;
      const subtitleParts = [j.commodity ?? j.job_type, partyName, docRef].filter(Boolean);
      return {
        entity_type: 'job' as const,
        id: j.id,
        title: j.job_number,
        subtitle: subtitleParts.join(' · ') || undefined,
        reference: j.job_number,
        status: j.status,
        matched_field: 'job',
      };
    });
  }

  private async searchQuotations(
    tenantId: string,
    term: string,
    limit: number,
    query: SearchQueryDto,
  ): Promise<SearchResultItem[]> {
    const where: Prisma.QuotationWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      AND: [
        {
          OR: [
            { quotation_number: { contains: term, mode: 'insensitive' } },
            { commodity: { contains: term, mode: 'insensitive' } },
            { remarks: { contains: term, mode: 'insensitive' } },
          ],
        },
        ...(query.customer_id || query.party_id
          ? [{ customer_id: query.customer_id ?? query.party_id }]
          : []),
        ...(query.status ? [{ status: query.status as never }] : []),
        ...(query.quotation_number
          ? [{ quotation_number: { contains: query.quotation_number, mode: 'insensitive' as const } }]
          : []),
        ...(query.salesperson_id ? [{ salesperson_id: query.salesperson_id }] : []),
        ...(query.branch_id ? [{ branch_id: query.branch_id }] : []),
      ],
    };

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.quotation.findMany({
        where,
        select: {
          id: true,
          quotation_number: true,
          status: true,
          commodity: true,
          customer_id: true,
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    );

    const customerIds = [...new Set(rows.map((q) => q.customer_id).filter(Boolean))];
    const customers =
      customerIds.length === 0
        ? []
        : await this.prisma.runWithTenant(tenantId, (tx) =>
            tx.party.findMany({
              where: { tenant_id: tenantId, id: { in: customerIds }, deleted_at: null },
              select: { id: true, name: true },
            }),
          );
    const customerNameById = new Map(customers.map((c) => [c.id, c.name]));

    return rows.map((q) => ({
      entity_type: 'quotation' as const,
      id: q.id,
      title: q.quotation_number,
      subtitle:
        [customerNameById.get(q.customer_id), q.commodity].filter(Boolean).join(' · ') || undefined,
      reference: q.quotation_number,
      status: q.status,
      matched_field: 'quotation',
    }));
  }

  private async searchParties(
    tenantId: string,
    term: string,
    limit: number,
    query: SearchQueryDto,
  ): Promise<SearchResultItem[]> {
    const where: Prisma.PartyWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      AND: [
        {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { code: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { phone: { contains: term, mode: 'insensitive' } },
            { vat_number: { contains: term, mode: 'insensitive' } },
          ],
        },
        ...(query.party_id ? [{ id: query.party_id }] : []),
        ...(query.status === 'active' ? [{ is_active: true }] : []),
        ...(query.status === 'inactive' ? [{ is_active: false }] : []),
      ],
    };

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.party.findMany({
        where,
        select: { id: true, name: true, code: true, party_type: true, is_active: true },
        take: limit,
        orderBy: { name: 'asc' },
      }),
    );

    return rows.map((p) => ({
      entity_type: 'party' as const,
      id: p.id,
      title: p.name,
      subtitle: p.party_type,
      reference: p.code,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      matched_field: 'party',
    }));
  }

  private async searchInvoices(
    tenantId: string,
    term: string,
    limit: number,
    query: SearchQueryDto,
  ): Promise<SearchResultItem[]> {
    const where: Prisma.InvoiceWhereInput = {
      tenant_id: tenantId,
      deleted_at: null,
      AND: [
        {
          OR: [
            { invoice_number: { contains: term, mode: 'insensitive' } },
            { remarks: { contains: term, mode: 'insensitive' } },
          ],
        },
        ...(query.party_id || query.customer_id
          ? [{ party_id: query.party_id ?? query.customer_id }]
          : []),
        ...(query.status ? [{ status: query.status as never }] : []),
        ...(query.invoice_number
          ? [{ invoice_number: { contains: query.invoice_number, mode: 'insensitive' as const } }]
          : []),
      ],
    };

    const rows = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.invoice.findMany({
        where,
        select: {
          id: true,
          invoice_number: true,
          status: true,
          invoice_type: true,
          party: { select: { name: true } },
        },
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    );

    return rows.map((i) => ({
      entity_type: 'invoice' as const,
      id: i.id,
      title: i.invoice_number,
      subtitle: [i.party?.name, i.invoice_type].filter(Boolean).join(' · ') || undefined,
      reference: i.invoice_number,
      status: i.status,
      matched_field: 'invoice',
    }));
  }
}

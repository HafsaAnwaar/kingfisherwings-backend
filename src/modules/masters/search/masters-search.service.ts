import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../prisma/prisma.service";
import { MasterSearchQueryDto } from "../dto/master-search-query.dto";

@Injectable()
export class MastersSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchAddresses(tenantId: string, query: MasterSearchQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const q = query.q.trim();
      const where: Prisma.PartyAddressWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        OR: [
          { address_line1: { contains: q, mode: "insensitive" } },
          { address_line2: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { state: { contains: q, mode: "insensitive" } },
          { postal_code: { contains: q, mode: "insensitive" } },
          { label: { contains: q, mode: "insensitive" } },
        ],
      };
      const [data, total] = await Promise.all([
        tx.partyAddress.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          include: {
            party: { select: { id: true, name: true, code: true } },
          },
        }),
        tx.partyAddress.count({ where }),
      ]);
      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 0,
        },
      };
    });
  }

  async searchContacts(tenantId: string, query: MasterSearchQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const q = query.q.trim();
      const where: Prisma.PartyContactWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { mobile: { contains: q, mode: "insensitive" } },
          { designation: { contains: q, mode: "insensitive" } },
        ],
      };
      const [data, total] = await Promise.all([
        tx.partyContact.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          include: {
            party: { select: { id: true, name: true, code: true } },
          },
        }),
        tx.partyContact.count({ where }),
      ]);
      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 0,
        },
      };
    });
  }

  async searchAttachments(tenantId: string, query: MasterSearchQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const q = query.q.trim();
      const where: Prisma.JobDocumentWhereInput = {
        tenant_id: tenantId,
        deleted_at: null,
        OR: [
          { file_name: { contains: q, mode: "insensitive" } },
          { reference_number: { contains: q, mode: "insensitive" } },
        ],
      };
      const [data, total] = await Promise.all([
        tx.jobDocument.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { created_at: "desc" },
          select: {
            id: true,
            job_id: true,
            document_type: true,
            reference_number: true,
            file_name: true,
            file_url: true,
            mime_type: true,
            file_size: true,
            created_at: true,
          },
        }),
        tx.jobDocument.count({ where }),
      ]);
      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 0,
        },
      };
    });
  }
}

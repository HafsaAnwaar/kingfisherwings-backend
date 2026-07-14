import { ConflictException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Party, Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../../prisma/prisma.service';

import { CreatePartyDto, UpdatePartyDto } from './dto/party.dto';
import { PartyQueryDto } from './dto/party-query.dto';
import { UpdateCreditStatusDto } from './dto/update-credit-status.dto';
import { CreatePartyContactDto, UpdatePartyContactDto } from './dto/party-contact.dto';
import { CreatePartyAddressDto, UpdatePartyAddressDto } from './dto/party-address.dto';
import { PartyImportResultDto } from './dto/party-import-result.dto';
import { CountryLocaleService } from '../../common/locale/country-locale.service';

const MAX_IMPORT_ROWS = 5000;

@Injectable()
export class PartiesService {
  private readonly logger = new Logger(PartiesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly locale: CountryLocaleService,
  ) {}

  // ============================================================
  // PARTY CRUD
  // ============================================================

  async create(tenantId: string, dto: CreatePartyDto, actorId?: string): Promise<Party> {
    await this.assertSalespersonValid(tenantId, dto.salesperson_id);
    await this.assertCompanyExists(tenantId, dto.company_id);

    const tenant = await this.prisma.tenant.findFirst({
      where: { id: tenantId, deleted_at: null },
      select: { country_code: true, base_currency: true },
    });
    // Prefer explicit party country; else tenant country; else leave unset (optional).
    const country = dto.country_code ?? tenant?.country_code ?? null;
    const currency =
      dto.currency_code ??
      tenant?.base_currency ??
      this.locale.getDefaultCurrency(country) ??
      undefined;

    try {
      return await this.prisma.runWithTenant(tenantId, (tx) =>
        tx.party.create({
          data: {
            tenant_id: tenantId,
            company_id: dto.company_id,
            party_type: dto.party_type,
            code: dto.code,
            name: dto.name,
            short_name: dto.short_name,
            vat_number: dto.vat_number,
            cr_number: dto.cr_number,
            country_code: country ?? undefined,
            city: dto.city,
            address: dto.address,
            phone: dto.phone,
            email: dto.email,
            credit_limit: dto.credit_limit,
            credit_days: dto.credit_days,
            currency_code: currency,
            salesperson_id: dto.salesperson_id,
            portal_access: dto.portal_access ?? false,
            marketing_subscription: dto.marketing_subscription ?? true,
            iata_code: dto.iata_code,
            scac_code: dto.scac_code,
            tags: dto.tags ?? [],
            notes: dto.notes,
            is_active: dto.is_active ?? true,
            created_by: actorId,
            updated_by: actorId,
          },
        }),
      );
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('A party with this code already exists.');
      }
      throw error;
    }
  }

  // ============================================================
  // CSV BULK IMPORT (spec Ch.27.3)
  //
  // Best-effort: every row is validated and inserted independently, so
  // one bad row (duplicate code, missing required field) doesn't
  // abort the whole file — it's reported in `errors` and the rest
  // still import. Expected columns match CreatePartyDto's fields;
  // `tags` uses "|" as the in-cell separator (commas are already the
  // CSV delimiter). Header row is case-insensitive, matched by name.
  // ============================================================

  async bulkImport(tenantId: string, fileBuffer: Buffer, actorId?: string): Promise<PartyImportResultDto> {
    let rows: Record<string, string>[];

    try {
      rows = parse(fileBuffer, {
        columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error: any) {
      throw new BadRequestException(`Could not parse CSV file: ${error.message}`);
    }

    if (rows.length === 0) {
      throw new BadRequestException('CSV file has no data rows.');
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestException(`CSV file has ${rows.length} rows — the limit is ${MAX_IMPORT_ROWS} per import.`);
    }

    const result: PartyImportResultDto = { total: rows.length, imported: 0, failed: 0, createdIds: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 1;
      const raw = rows[i];

      const candidate = {
        party_type: raw.party_type?.toUpperCase(),
        code: raw.code,
        name: raw.name,
        short_name: raw.short_name || undefined,
        vat_number: raw.vat_number || undefined,
        cr_number: raw.cr_number || undefined,
        country_code: raw.country_code || undefined,
        city: raw.city || undefined,
        address: raw.address || undefined,
        phone: raw.phone || undefined,
        email: raw.email || undefined,
        credit_limit: raw.credit_limit ? Number(raw.credit_limit) : undefined,
        credit_days: raw.credit_days ? Number(raw.credit_days) : undefined,
        currency_code: raw.currency_code || undefined,
        iata_code: raw.iata_code || undefined,
        scac_code: raw.scac_code || undefined,
        tags: raw.tags ? raw.tags.split('|').map((t) => t.trim()).filter(Boolean) : undefined,
        notes: raw.notes || undefined,
      };

      const dto = plainToInstance(CreatePartyDto, candidate);
      const validationErrors = await validate(dto, { whitelist: true });

      if (validationErrors.length > 0) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          message: validationErrors
            .map((e) => Object.values(e.constraints ?? {}).join('; '))
            .join(' | '),
        });
        continue;
      }

      try {
        const party = await this.create(tenantId, dto, actorId);
        result.imported++;
        result.createdIds.push(party.id);
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          code: candidate.code,
          message: error instanceof ConflictException ? error.message : 'Failed to create record.',
        });
      }
    }

    this.logger.log(
      `[BULK_IMPORT] Tenant ${tenantId}: ${result.imported}/${result.total} parties imported, ${result.failed} failed`,
    );

    return result;
  }

  async findAll(tenantId: string, query: PartyQueryDto) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const where: Prisma.PartyWhereInput = { tenant_id: tenantId, deleted_at: null };

      if (query.party_type) {
        where.party_type = query.party_type;
      }

      if (query.credit_status) {
        where.credit_status = query.credit_status;
      }

      if (query.company_id) {
        where.company_id = query.company_id;
      }

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { short_name: { contains: query.search, mode: 'insensitive' } },
          { code: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const [data, total] = await Promise.all([
        tx.party.findMany({
          where,
          skip: (query.page - 1) * query.limit,
          take: query.limit,
          orderBy: { name: query.order },
        }),
        tx.party.count({ where }),
      ]);

      return {
        data,
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit) || 1,
        },
      };
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const party = await tx.party.findFirst({
        where: { id, tenant_id: tenantId, deleted_at: null },
        include: {
          contacts: { where: { deleted_at: null }, orderBy: { is_primary: 'desc' } },
          addresses: { where: { deleted_at: null }, orderBy: { is_default: 'desc' } },
        },
      });

      if (!party) {
        throw new NotFoundException('Party not found.');
      }

      return party;
    });
  }

  async update(tenantId: string, id: string, dto: UpdatePartyDto, actorId?: string): Promise<Party> {
    await this.assertSalespersonValid(tenantId, dto.salesperson_id);
    await this.assertCompanyExists(tenantId, dto.company_id);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });

      if (!existing) {
        throw new NotFoundException('Party not found.');
      }

      try {
        return await tx.party.update({
          where: { id },
          data: { ...dto, updated_by: actorId },
        });
      } catch (error: any) {
        if (error?.code === 'P2002') {
          throw new ConflictException('A party with this code already exists.');
        }
        throw error;
      }
    });
  }

  async softDelete(tenantId: string, id: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });

      if (!existing) {
        throw new NotFoundException('Party not found.');
      }

      await tx.party.update({ where: { id }, data: { deleted_at: new Date(), updated_by: actorId } });
    });
  }

  // ============================================================
  // CREDIT STATUS — separate from general update; this is a
  // sensitive action (holding/blacklisting a customer stops them
  // being invoiced) so it gets its own endpoint and audit trail note.
  // ============================================================

  async updateCreditStatus(
    tenantId: string,
    id: string,
    dto: UpdateCreditStatusDto,
    actorId?: string,
  ): Promise<Party> {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });

      if (!existing) {
        throw new NotFoundException('Party not found.');
      }

      this.logger.log(
        `[CREDIT_STATUS] Party ${id}: ${existing.credit_status} -> ${dto.credit_status}` +
          (dto.reason ? ` (${dto.reason})` : ''),
      );

      const noteEntry = `[${new Date().toISOString()}] Credit status changed to ${dto.credit_status}${
        dto.reason ? `: ${dto.reason}` : ''
      }`;

      return tx.party.update({
        where: { id },
        data: {
          credit_status: dto.credit_status,
          notes: existing.notes ? `${existing.notes}\n${noteEntry}` : noteEntry,
          updated_by: actorId,
        },
      });
    });
  }

  // ============================================================
  // CONTACTS
  // ============================================================

  async addContact(tenantId: string, partyId: string, dto: CreatePartyContactDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertPartyExists(tx, tenantId, partyId);

      if (dto.is_primary) {
        await tx.partyContact.updateMany({
          where: { tenant_id: tenantId, party_id: partyId, is_primary: true },
          data: { is_primary: false },
        });
      }

      return tx.partyContact.create({
        data: {
          tenant_id: tenantId,
          party_id: partyId,
          name: dto.name,
          designation: dto.designation,
          phone: dto.phone,
          mobile: dto.mobile,
          email: dto.email,
          is_primary: dto.is_primary ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateContact(
    tenantId: string,
    partyId: string,
    contactId: string,
    dto: UpdatePartyContactDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const contact = await tx.partyContact.findFirst({
        where: { id: contactId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found.');
      }

      if (dto.is_primary) {
        await tx.partyContact.updateMany({
          where: { tenant_id: tenantId, party_id: partyId, is_primary: true, id: { not: contactId } },
          data: { is_primary: false },
        });
      }

      return tx.partyContact.update({
        where: { id: contactId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async removeContact(tenantId: string, partyId: string, contactId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const contact = await tx.partyContact.findFirst({
        where: { id: contactId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found.');
      }

      await tx.partyContact.update({
        where: { id: contactId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // ADDRESSES
  // ============================================================

  async addAddress(tenantId: string, partyId: string, dto: CreatePartyAddressDto, actorId?: string) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      await this.assertPartyExists(tx, tenantId, partyId);

      if (dto.is_default) {
        await tx.partyAddress.updateMany({
          where: { tenant_id: tenantId, party_id: partyId, is_default: true },
          data: { is_default: false },
        });
      }

      return tx.partyAddress.create({
        data: {
          tenant_id: tenantId,
          party_id: partyId,
          label: dto.label,
          address_line1: dto.address_line1,
          address_line2: dto.address_line2,
          city: dto.city,
          state: dto.state,
          postal_code: dto.postal_code,
          country_code: dto.country_code,
          is_default: dto.is_default ?? false,
          created_by: actorId,
          updated_by: actorId,
        },
      });
    });
  }

  async updateAddress(
    tenantId: string,
    partyId: string,
    addressId: string,
    dto: UpdatePartyAddressDto,
    actorId?: string,
  ) {
    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const address = await tx.partyAddress.findFirst({
        where: { id: addressId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
      });

      if (!address) {
        throw new NotFoundException('Address not found.');
      }

      if (dto.is_default) {
        await tx.partyAddress.updateMany({
          where: { tenant_id: tenantId, party_id: partyId, is_default: true, id: { not: addressId } },
          data: { is_default: false },
        });
      }

      return tx.partyAddress.update({
        where: { id: addressId },
        data: { ...dto, updated_by: actorId },
      });
    });
  }

  async removeAddress(tenantId: string, partyId: string, addressId: string, actorId?: string): Promise<void> {
    await this.prisma.runWithTenant(tenantId, async (tx) => {
      const address = await tx.partyAddress.findFirst({
        where: { id: addressId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
      });

      if (!address) {
        throw new NotFoundException('Address not found.');
      }

      await tx.partyAddress.update({
        where: { id: addressId },
        data: { deleted_at: new Date(), updated_by: actorId },
      });
    });
  }

  // ============================================================
  // HISTORY + EXPORT (Week 2 / 6)
  // ============================================================

  async getHistory(tenantId: string, partyId: string) {
    await this.findOne(tenantId, partyId);

    return this.prisma.runWithTenant(tenantId, async (tx) => {
      const [jobsAsShipper, jobsAsConsignee, quotations, invoices, paymentRequests, audit] =
        await Promise.all([
          tx.job.findMany({
            where: { tenant_id: tenantId, shipper_id: partyId, deleted_at: null },
            select: { id: true, job_number: true, job_type: true, status: true, created_at: true },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
          tx.job.findMany({
            where: { tenant_id: tenantId, consignee_id: partyId, deleted_at: null },
            select: { id: true, job_number: true, job_type: true, status: true, created_at: true },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
          tx.quotation.findMany({
            where: { tenant_id: tenantId, customer_id: partyId, deleted_at: null },
            select: { id: true, quotation_number: true, status: true, created_at: true, revenue_total: true },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
          tx.invoice.findMany({
            where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
            select: {
              id: true,
              invoice_number: true,
              status: true,
              invoice_type: true,
              total_amount: true,
              created_at: true,
            },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
          tx.paymentRequest.findMany({
            where: { tenant_id: tenantId, party_id: partyId, deleted_at: null },
            select: { id: true, request_number: true, status: true, amount: true, created_at: true },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
          tx.auditLog.findMany({
            where: {
              tenant_id: tenantId,
              entity: { in: ['Party', 'party', 'PARTIES'] },
              entity_id: partyId,
            },
            take: 50,
            orderBy: { created_at: 'desc' },
          }),
        ]);

      return {
        party_id: partyId,
        jobs: [...jobsAsShipper, ...jobsAsConsignee],
        quotations,
        invoices,
        payment_requests: paymentRequests,
        audit_trail: audit,
      };
    });
  }

  async exportCsv(tenantId: string, query: PartyQueryDto) {
    const page = await this.findAll(tenantId, { ...query, page: 1, limit: 5000 });
    const rows = page.data as Array<Record<string, unknown>>;
    const headers = [
      'party_type',
      'code',
      'name',
      'short_name',
      'vat_number',
      'country_code',
      'city',
      'phone',
      'email',
      'currency_code',
      'is_active',
    ];
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => escape(row[h])).join(','));
    }
    return {
      content_type: 'text/csv',
      filename: 'parties-export.csv',
      csv: lines.join('\n'),
      count: rows.length,
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================

  private async assertPartyExists(tx: Prisma.TransactionClient, tenantId: string, partyId: string): Promise<void> {
    const exists = await tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } });

    if (!exists) {
      throw new NotFoundException('Party not found.');
    }
  }

  private async assertCompanyExists(tenantId: string, companyId?: string): Promise<void> {
    if (!companyId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.company.findFirst({ where: { id: companyId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Company not found.');
    }
  }

  private async assertSalespersonValid(tenantId: string, userId?: string): Promise<void> {
    if (!userId) {
      return;
    }

    const exists = await this.prisma.runWithTenant(tenantId, (tx) =>
      tx.user.findFirst({ where: { id: userId, tenant_id: tenantId, deleted_at: null } }),
    );

    if (!exists) {
      throw new NotFoundException('Salesperson (user) not found.');
    }
  }
}

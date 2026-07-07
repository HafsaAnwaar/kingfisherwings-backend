"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PartiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartiesService = void 0;
const common_1 = require("@nestjs/common");
const sync_1 = require("csv-parse/sync");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const prisma_service_1 = require("../../prisma/prisma.service");
const party_dto_1 = require("./dto/party.dto");
const MAX_IMPORT_ROWS = 5000;
let PartiesService = PartiesService_1 = class PartiesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PartiesService_1.name);
    }
    async create(tenantId, dto, actorId) {
        await this.assertSalespersonValid(tenantId, dto.salesperson_id);
        try {
            return await this.prisma.runWithTenant(tenantId, (tx) => tx.party.create({
                data: {
                    tenant_id: tenantId,
                    party_type: dto.party_type,
                    code: dto.code,
                    name: dto.name,
                    short_name: dto.short_name,
                    vat_number: dto.vat_number,
                    cr_number: dto.cr_number,
                    country_code: dto.country_code,
                    city: dto.city,
                    address: dto.address,
                    phone: dto.phone,
                    email: dto.email,
                    credit_limit: dto.credit_limit,
                    credit_days: dto.credit_days,
                    currency_code: dto.currency_code,
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
            }));
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.ConflictException('A party with this code already exists.');
            }
            throw error;
        }
    }
    async bulkImport(tenantId, fileBuffer, actorId) {
        let rows;
        try {
            rows = (0, sync_1.parse)(fileBuffer, {
                columns: (header) => header.map((h) => h.trim().toLowerCase()),
                skip_empty_lines: true,
                trim: true,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Could not parse CSV file: ${error.message}`);
        }
        if (rows.length === 0) {
            throw new common_1.BadRequestException('CSV file has no data rows.');
        }
        if (rows.length > MAX_IMPORT_ROWS) {
            throw new common_1.BadRequestException(`CSV file has ${rows.length} rows — the limit is ${MAX_IMPORT_ROWS} per import.`);
        }
        const result = { total: rows.length, imported: 0, failed: 0, createdIds: [], errors: [] };
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
            const dto = (0, class_transformer_1.plainToInstance)(party_dto_1.CreatePartyDto, candidate);
            const validationErrors = await (0, class_validator_1.validate)(dto, { whitelist: true });
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
            }
            catch (error) {
                result.failed++;
                result.errors.push({
                    row: rowNumber,
                    code: candidate.code,
                    message: error instanceof common_1.ConflictException ? error.message : 'Failed to create record.',
                });
            }
        }
        this.logger.log(`[BULK_IMPORT] Tenant ${tenantId}: ${result.imported}/${result.total} parties imported, ${result.failed} failed`);
        return result;
    }
    async findAll(tenantId, query) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const where = { tenant_id: tenantId, deleted_at: null };
            if (query.party_type) {
                where.party_type = query.party_type;
            }
            if (query.credit_status) {
                where.credit_status = query.credit_status;
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
    async findOne(tenantId, id) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const party = await tx.party.findFirst({
                where: { id, tenant_id: tenantId, deleted_at: null },
                include: {
                    contacts: { where: { deleted_at: null }, orderBy: { is_primary: 'desc' } },
                    addresses: { where: { deleted_at: null }, orderBy: { is_default: 'desc' } },
                },
            });
            if (!party) {
                throw new common_1.NotFoundException('Party not found.');
            }
            return party;
        });
    }
    async update(tenantId, id, dto, actorId) {
        await this.assertSalespersonValid(tenantId, dto.salesperson_id);
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });
            if (!existing) {
                throw new common_1.NotFoundException('Party not found.');
            }
            try {
                return await tx.party.update({
                    where: { id },
                    data: { ...dto, updated_by: actorId },
                });
            }
            catch (error) {
                if (error?.code === 'P2002') {
                    throw new common_1.ConflictException('A party with this code already exists.');
                }
                throw error;
            }
        });
    }
    async softDelete(tenantId, id, actorId) {
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });
            if (!existing) {
                throw new common_1.NotFoundException('Party not found.');
            }
            await tx.party.update({ where: { id }, data: { deleted_at: new Date(), updated_by: actorId } });
        });
    }
    async updateCreditStatus(tenantId, id, dto, actorId) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await tx.party.findFirst({ where: { id, tenant_id: tenantId, deleted_at: null } });
            if (!existing) {
                throw new common_1.NotFoundException('Party not found.');
            }
            this.logger.log(`[CREDIT_STATUS] Party ${id}: ${existing.credit_status} -> ${dto.credit_status}` +
                (dto.reason ? ` (${dto.reason})` : ''));
            const noteEntry = `[${new Date().toISOString()}] Credit status changed to ${dto.credit_status}${dto.reason ? `: ${dto.reason}` : ''}`;
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
    async addContact(tenantId, partyId, dto, actorId) {
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
    async updateContact(tenantId, partyId, contactId, dto, actorId) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const contact = await tx.partyContact.findFirst({
                where: { id: contactId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
            });
            if (!contact) {
                throw new common_1.NotFoundException('Contact not found.');
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
    async removeContact(tenantId, partyId, contactId, actorId) {
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const contact = await tx.partyContact.findFirst({
                where: { id: contactId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
            });
            if (!contact) {
                throw new common_1.NotFoundException('Contact not found.');
            }
            await tx.partyContact.update({
                where: { id: contactId },
                data: { deleted_at: new Date(), updated_by: actorId },
            });
        });
    }
    async addAddress(tenantId, partyId, dto, actorId) {
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
    async updateAddress(tenantId, partyId, addressId, dto, actorId) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const address = await tx.partyAddress.findFirst({
                where: { id: addressId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found.');
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
    async removeAddress(tenantId, partyId, addressId, actorId) {
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const address = await tx.partyAddress.findFirst({
                where: { id: addressId, party_id: partyId, tenant_id: tenantId, deleted_at: null },
            });
            if (!address) {
                throw new common_1.NotFoundException('Address not found.');
            }
            await tx.partyAddress.update({
                where: { id: addressId },
                data: { deleted_at: new Date(), updated_by: actorId },
            });
        });
    }
    async assertPartyExists(tx, tenantId, partyId) {
        const exists = await tx.party.findFirst({ where: { id: partyId, tenant_id: tenantId, deleted_at: null } });
        if (!exists) {
            throw new common_1.NotFoundException('Party not found.');
        }
    }
    async assertSalespersonValid(tenantId, userId) {
        if (!userId) {
            return;
        }
        const exists = await this.prisma.runWithTenant(tenantId, (tx) => tx.user.findFirst({ where: { id: userId, tenant_id: tenantId, deleted_at: null } }));
        if (!exists) {
            throw new common_1.NotFoundException('Salesperson (user) not found.');
        }
    }
};
exports.PartiesService = PartiesService;
exports.PartiesService = PartiesService = PartiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PartiesService);
//# sourceMappingURL=parties.service.js.map
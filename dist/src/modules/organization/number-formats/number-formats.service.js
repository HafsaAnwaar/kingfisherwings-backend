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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFormatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let NumberFormatsService = class NumberFormatsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto, actorId) {
        try {
            return await this.prisma.runWithTenant(tenantId, (tx) => tx.documentNumberFormat.create({
                data: {
                    tenant_id: tenantId,
                    document_type: dto.document_type,
                    prefix: dto.prefix,
                    include_branch_code: dto.include_branch_code ?? false,
                    include_year: dto.include_year ?? true,
                    year_digits: dto.year_digits ?? 2,
                    include_month: dto.include_month ?? false,
                    sequence_length: dto.sequence_length ?? 5,
                    separator: dto.separator ?? '/',
                    reset_frequency: dto.reset_frequency ?? 'YEARLY',
                    is_active: dto.is_active ?? true,
                    created_by: actorId,
                    updated_by: actorId,
                },
            }));
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new common_1.ConflictException('A number format is already configured for this document type.');
            }
            throw error;
        }
    }
    async findAll(tenantId) {
        return this.prisma.runWithTenant(tenantId, (tx) => tx.documentNumberFormat.findMany({ where: { tenant_id: tenantId }, orderBy: { document_type: 'asc' } }));
    }
    async findOne(tenantId, documentType) {
        const format = await this.prisma.runWithTenant(tenantId, (tx) => tx.documentNumberFormat.findFirst({ where: { tenant_id: tenantId, document_type: documentType } }));
        if (!format) {
            throw new common_1.NotFoundException(`No number format configured for ${documentType}.`);
        }
        return format;
    }
    async update(tenantId, documentType, dto, actorId) {
        const existing = await this.findOne(tenantId, documentType);
        return this.prisma.runWithTenant(tenantId, (tx) => tx.documentNumberFormat.update({
            where: { id: existing.id },
            data: { ...dto, updated_by: actorId },
        }));
    }
};
exports.NumberFormatsService = NumberFormatsService;
exports.NumberFormatsService = NumberFormatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NumberFormatsService);
//# sourceMappingURL=number-formats.service.js.map
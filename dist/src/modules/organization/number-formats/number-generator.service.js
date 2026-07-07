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
exports.NumberGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let NumberGeneratorService = class NumberGeneratorService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(tenantId, documentType, options = {}) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const format = await tx.documentNumberFormat.findFirst({
                where: { tenant_id: tenantId, document_type: documentType, is_active: true },
            });
            if (!format) {
                throw new common_1.NotFoundException(`No active number format configured for ${documentType}. Configure one at POST /organization/number-formats first.`);
            }
            const now = new Date();
            const periodKey = this.periodKey(format.reset_frequency, now);
            const branchCode = format.include_branch_code ? options.branchCode ?? '' : '';
            const sequence = await tx.documentNumberSequence.upsert({
                where: {
                    tenant_id_document_type_branch_code_period_key: {
                        tenant_id: tenantId,
                        document_type: documentType,
                        branch_code: branchCode,
                        period_key: periodKey,
                    },
                },
                create: {
                    tenant_id: tenantId,
                    document_type: documentType,
                    branch_code: branchCode,
                    period_key: periodKey,
                    last_sequence: 1,
                },
                update: {
                    last_sequence: { increment: 1 },
                },
            });
            return this.assemble(format, sequence.last_sequence, now, branchCode, options.extraSegment);
        });
    }
    async preview(tenantId, documentType, options = {}) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const format = await tx.documentNumberFormat.findFirst({
                where: { tenant_id: tenantId, document_type: documentType },
            });
            if (!format) {
                throw new common_1.NotFoundException(`No number format configured for ${documentType}.`);
            }
            const now = new Date();
            const periodKey = this.periodKey(format.reset_frequency, now);
            const branchCode = format.include_branch_code ? options.branchCode ?? '' : '';
            const existing = await tx.documentNumberSequence.findFirst({
                where: { tenant_id: tenantId, document_type: documentType, branch_code: branchCode, period_key: periodKey },
            });
            const nextSequence = (existing?.last_sequence ?? 0) + 1;
            return this.assemble(format, nextSequence, now, branchCode, options.extraSegment);
        });
    }
    periodKey(resetFrequency, at) {
        if (resetFrequency === 'YEARLY') {
            return String(at.getFullYear());
        }
        if (resetFrequency === 'MONTHLY') {
            return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}`;
        }
        return '';
    }
    assemble(format, sequence, at, branchCode, extraSegment) {
        const segments = [format.prefix];
        if (extraSegment) {
            segments.push(extraSegment);
        }
        if (format.include_branch_code && branchCode) {
            segments.push(branchCode);
        }
        if (format.include_month) {
            segments.push(String(at.getMonth() + 1).padStart(2, '0'));
        }
        if (format.include_year) {
            const year = format.year_digits === 4 ? String(at.getFullYear()) : String(at.getFullYear()).slice(-2);
            segments.push(year);
        }
        segments.push(String(sequence).padStart(format.sequence_length, '0'));
        return segments.join(format.separator);
    }
};
exports.NumberGeneratorService = NumberGeneratorService;
exports.NumberGeneratorService = NumberGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NumberGeneratorService);
//# sourceMappingURL=number-generator.service.js.map
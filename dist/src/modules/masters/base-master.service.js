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
exports.BaseMasterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BaseMasterService = class BaseMasterService {
    constructor(prisma) {
        this.prisma = prisma;
        this.supportsIsActive = true;
    }
    delegate(tx) {
        return tx[this.modelName];
    }
    async create(tenantId, data, actorId) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            try {
                return await this.delegate(tx).create({
                    data: { ...data, tenant_id: tenantId, created_by: actorId, updated_by: actorId },
                });
            }
            catch (error) {
                if (error?.code === 'P2002') {
                    throw new common_1.ConflictException(`A record with this ${this.uniqueKeyLabel} already exists.`);
                }
                throw error;
            }
        });
    }
    async findAll(tenantId, query) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const where = { tenant_id: tenantId, deleted_at: null };
            if (query.is_active !== undefined && this.supportsIsActive) {
                where.is_active = query.is_active;
            }
            if (query.search && this.searchFields.length > 0) {
                where.OR = this.searchFields.map((field) => ({
                    [field]: { contains: query.search, mode: 'insensitive' },
                }));
            }
            const [data, total] = await Promise.all([
                this.delegate(tx).findMany({
                    where,
                    skip: (query.page - 1) * query.limit,
                    take: query.limit,
                    orderBy: { created_at: query.order },
                }),
                this.delegate(tx).count({ where }),
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
            const record = await this.delegate(tx).findFirst({
                where: { id, tenant_id: tenantId, deleted_at: null },
            });
            if (!record) {
                throw new common_1.NotFoundException('Record not found.');
            }
            return record;
        });
    }
    async update(tenantId, id, data, actorId) {
        return this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await this.delegate(tx).findFirst({
                where: { id, tenant_id: tenantId, deleted_at: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Record not found.');
            }
            try {
                return await this.delegate(tx).update({
                    where: { id },
                    data: { ...data, updated_by: actorId },
                });
            }
            catch (error) {
                if (error?.code === 'P2002') {
                    throw new common_1.ConflictException(`A record with this ${this.uniqueKeyLabel} already exists.`);
                }
                throw error;
            }
        });
    }
    async softDelete(tenantId, id, actorId) {
        await this.prisma.runWithTenant(tenantId, async (tx) => {
            const existing = await this.delegate(tx).findFirst({
                where: { id, tenant_id: tenantId, deleted_at: null },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Record not found.');
            }
            await this.delegate(tx).update({
                where: { id },
                data: { deleted_at: new Date(), updated_by: actorId },
            });
        });
    }
};
exports.BaseMasterService = BaseMasterService;
exports.BaseMasterService = BaseMasterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BaseMasterService);
//# sourceMappingURL=base-master.service.js.map
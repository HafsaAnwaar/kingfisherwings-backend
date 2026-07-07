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
exports.CurrenciesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_master_service_1 = require("../base-master.service");
let CurrenciesService = class CurrenciesService extends base_master_service_1.BaseMasterService {
    constructor(prisma) {
        super(prisma);
        this.modelName = 'currency';
        this.searchFields = ['name', 'code'];
        this.uniqueKeyLabel = 'currency code';
    }
    async create(tenantId, data, actorId) {
        if (data.is_base) {
            await this.clearExistingBaseCurrency(tenantId);
        }
        return super.create(tenantId, data, actorId);
    }
    async update(tenantId, id, data, actorId) {
        if (data.is_base) {
            await this.clearExistingBaseCurrency(tenantId, id);
        }
        return super.update(tenantId, id, data, actorId);
    }
    async clearExistingBaseCurrency(tenantId, excludeId) {
        await this.prisma.runWithTenant(tenantId, (tx) => tx.currency.updateMany({
            where: { tenant_id: tenantId, is_base: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
            data: { is_base: false },
        }));
    }
};
exports.CurrenciesService = CurrenciesService;
exports.CurrenciesService = CurrenciesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CurrenciesService);
//# sourceMappingURL=currencies.service.js.map
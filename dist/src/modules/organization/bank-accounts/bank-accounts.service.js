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
exports.BankAccountsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_master_service_1 = require("../../masters/base-master.service");
let BankAccountsService = class BankAccountsService extends base_master_service_1.BaseMasterService {
    constructor(prisma) {
        super(prisma);
        this.modelName = 'tenantBankAccount';
        this.searchFields = ['bank_name', 'account_name', 'account_number'];
        this.uniqueKeyLabel = 'bank account';
    }
    async create(tenantId, data, actorId) {
        if (data.is_default) {
            await this.clearExistingDefault(tenantId);
        }
        return super.create(tenantId, data, actorId);
    }
    async update(tenantId, id, data, actorId) {
        if (data.is_default) {
            await this.clearExistingDefault(tenantId, id);
        }
        return super.update(tenantId, id, data, actorId);
    }
    async clearExistingDefault(tenantId, excludeId) {
        await this.prisma.runWithTenant(tenantId, (tx) => tx.tenantBankAccount.updateMany({
            where: { tenant_id: tenantId, is_default: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
            data: { is_default: false },
        }));
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankAccountsService);
//# sourceMappingURL=bank-accounts.service.js.map
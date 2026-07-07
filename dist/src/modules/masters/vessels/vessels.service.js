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
exports.VesselsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_master_service_1 = require("../base-master.service");
let VesselsService = class VesselsService extends base_master_service_1.BaseMasterService {
    constructor(prisma) {
        super(prisma);
        this.modelName = 'vessel';
        this.searchFields = ['name', 'imo_number'];
        this.uniqueKeyLabel = 'vessel';
    }
    async create(tenantId, data, actorId) {
        await this.assertShippingLineExists(tenantId, data.shipping_line_id);
        return super.create(tenantId, data, actorId);
    }
    async update(tenantId, id, data, actorId) {
        await this.assertShippingLineExists(tenantId, data.shipping_line_id);
        return super.update(tenantId, id, data, actorId);
    }
    async assertShippingLineExists(tenantId, shippingLineId) {
        if (!shippingLineId) {
            return;
        }
        const exists = await this.prisma.runWithTenant(tenantId, (tx) => tx.shippingLine.findFirst({
            where: { id: shippingLineId, tenant_id: tenantId, deleted_at: null },
        }));
        if (!exists) {
            throw new common_1.NotFoundException('Shipping line not found.');
        }
    }
};
exports.VesselsService = VesselsService;
exports.VesselsService = VesselsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VesselsService);
//# sourceMappingURL=vessels.service.js.map
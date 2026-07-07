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
exports.DepartmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const base_master_service_1 = require("../base-master.service");
let DepartmentsService = class DepartmentsService extends base_master_service_1.BaseMasterService {
    constructor(prisma) {
        super(prisma);
        this.modelName = 'department';
        this.searchFields = ['name', 'code'];
        this.uniqueKeyLabel = 'department code';
    }
    async create(tenantId, data, actorId) {
        await this.assertParentValid(tenantId, data.parent_id);
        return super.create(tenantId, data, actorId);
    }
    async update(tenantId, id, data, actorId) {
        if (data.parent_id === id) {
            throw new common_1.BadRequestException('A department cannot be its own parent.');
        }
        await this.assertParentValid(tenantId, data.parent_id);
        return super.update(tenantId, id, data, actorId);
    }
    async assertParentValid(tenantId, parentId) {
        if (!parentId) {
            return;
        }
        const exists = await this.prisma.runWithTenant(tenantId, (tx) => tx.department.findFirst({ where: { id: parentId, tenant_id: tenantId, deleted_at: null } }));
        if (!exists) {
            throw new common_1.NotFoundException('Parent department not found.');
        }
    }
};
exports.DepartmentsService = DepartmentsService;
exports.DepartmentsService = DepartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DepartmentsService);
//# sourceMappingURL=departments.service.js.map
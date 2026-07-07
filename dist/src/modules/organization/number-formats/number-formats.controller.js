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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberFormatsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const number_formats_service_1 = require("./number-formats.service");
const number_generator_service_1 = require("./number-generator.service");
const number_format_dto_1 = require("../dto/number-format.dto");
const roles_guard_1 = require("../../users/guards/roles.guard");
const roles_decorator_1 = require("../../users/decorators/roles.decorator");
const current_user_decorator_1 = require("../../users/decorators/current-user.decorator");
let NumberFormatsController = class NumberFormatsController {
    constructor(service, generator) {
        this.service = service;
        this.generator = generator;
    }
    findAll(tenantId) {
        return this.service.findAll(tenantId);
    }
    findOne(tenantId, documentType) {
        return this.service.findOne(tenantId, documentType);
    }
    preview(tenantId, documentType) {
        return this.generator.preview(tenantId, documentType).then((example) => ({ example }));
    }
    create(tenantId, actorId, dto) {
        return this.service.create(tenantId, dto, actorId);
    }
    update(tenantId, actorId, documentType, dto) {
        return this.service.update(tenantId, documentType, dto, actorId);
    }
};
exports.NumberFormatsController = NumberFormatsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all configured document number formats (Ch.2.2)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NumberFormatsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':documentType'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the number format for one document type' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NumberFormatsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':documentType/preview'),
    (0, swagger_1.ApiOperation)({ summary: 'Preview the next number for this format without consuming a sequence value' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('documentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NumberFormatsController.prototype, "preview", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Configure the number format for a document type' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, number_format_dto_1.CreateNumberFormatDto]),
    __metadata("design:returntype", void 0)
], NumberFormatsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':documentType'),
    (0, swagger_1.ApiOperation)({ summary: 'Update the number format for a document type' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('documentType')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, number_format_dto_1.UpdateNumberFormatDto]),
    __metadata("design:returntype", void 0)
], NumberFormatsController.prototype, "update", null);
exports.NumberFormatsController = NumberFormatsController = __decorate([
    (0, swagger_1.ApiTags)('Organization — Number Formats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.TENANT_ADMIN),
    (0, common_1.Controller)('organization/number-formats'),
    __metadata("design:paramtypes", [number_formats_service_1.NumberFormatsService,
        number_generator_service_1.NumberGeneratorService])
], NumberFormatsController);
//# sourceMappingURL=number-formats.controller.js.map
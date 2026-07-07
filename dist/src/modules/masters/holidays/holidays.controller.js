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
exports.HolidaysController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const holidays_service_1 = require("./holidays.service");
const holiday_dto_1 = require("../dto/holiday.dto");
const master_query_dto_1 = require("../dto/master-query.dto");
const roles_guard_1 = require("../../users/guards/roles.guard");
const permissions_guard_1 = require("../../users/guards/permissions.guard");
const permissions_decorator_1 = require("../../users/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../users/decorators/current-user.decorator");
const masters_permission_constants_1 = require("../constants/masters-permission.constants");
let HolidaysController = class HolidaysController {
    constructor(service) {
        this.service = service;
    }
    findAll(tenantId, query) {
        return this.service.findAll(tenantId, query);
    }
    findOne(tenantId, id) {
        return this.service.findOne(tenantId, id);
    }
    create(tenantId, actorId, dto) {
        return this.service.create(tenantId, { ...dto }, actorId);
    }
    update(tenantId, actorId, id, dto) {
        return this.service.update(tenantId, id, { ...dto }, actorId);
    }
    async remove(tenantId, actorId, id) {
        await this.service.softDelete(tenantId, id, actorId);
    }
};
exports.HolidaysController = HolidaysController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'list holidays' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, master_query_dto_1.MasterQueryDto]),
    __metadata("design:returntype", void 0)
], HolidaysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get a record by id' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HolidaysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a record' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, holiday_dto_1.CreateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidaysController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update a record' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, holiday_dto_1.UpdateHolidayDto]),
    __metadata("design:returntype", void 0)
], HolidaysController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a record' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], HolidaysController.prototype, "remove", null);
exports.HolidaysController = HolidaysController = __decorate([
    (0, swagger_1.ApiTags)('Masters — Holidays'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('masters/holidays'),
    __metadata("design:paramtypes", [holidays_service_1.HolidaysService])
], HolidaysController);
//# sourceMappingURL=holidays.controller.js.map
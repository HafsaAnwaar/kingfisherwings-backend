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
exports.ExchangeRatesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exchange_rates_service_1 = require("./exchange-rates.service");
const exchange_rate_dto_1 = require("../dto/exchange-rate.dto");
const master_query_dto_1 = require("../dto/master-query.dto");
const roles_guard_1 = require("../../users/guards/roles.guard");
const permissions_guard_1 = require("../../users/guards/permissions.guard");
const permissions_decorator_1 = require("../../users/decorators/permissions.decorator");
const current_user_decorator_1 = require("../../users/decorators/current-user.decorator");
const masters_permission_constants_1 = require("../constants/masters-permission.constants");
let ExchangeRatesController = class ExchangeRatesController {
    constructor(service) {
        this.service = service;
    }
    findAll(tenantId, query, currencyId) {
        return this.service.findAll(tenantId, { ...query, currency_id: currencyId });
    }
    latest(tenantId, currencyId) {
        return this.service.latest(tenantId, currencyId);
    }
    create(tenantId, actorId, dto) {
        return this.service.create(tenantId, dto, actorId);
    }
};
exports.ExchangeRatesController = ExchangeRatesController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List exchange rates, optionally filtered by currency' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Query)('currency_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, master_query_dto_1.MasterQueryDto, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest/:currencyId'),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Most recent rate on file for a currency' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('currencyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "latest", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(masters_permission_constants_1.MASTERS_PERMISSIONS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Record (or correct) an exchange rate for a date — upserts by currency + date' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, exchange_rate_dto_1.CreateExchangeRateDto]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "create", null);
exports.ExchangeRatesController = ExchangeRatesController = __decorate([
    (0, swagger_1.ApiTags)('Masters — Exchange Rates'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('masters/exchange-rates'),
    __metadata("design:paramtypes", [exchange_rates_service_1.ExchangeRatesService])
], ExchangeRatesController);
//# sourceMappingURL=exchange-rates.controller.js.map
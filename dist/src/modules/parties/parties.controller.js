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
exports.PartiesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
require("multer");
const swagger_1 = require("@nestjs/swagger");
const parties_service_1 = require("./parties.service");
const party_dto_1 = require("./dto/party.dto");
const party_query_dto_1 = require("./dto/party-query.dto");
const update_credit_status_dto_1 = require("./dto/update-credit-status.dto");
const party_contact_dto_1 = require("./dto/party-contact.dto");
const party_address_dto_1 = require("./dto/party-address.dto");
const roles_guard_1 = require("../users/guards/roles.guard");
const permissions_guard_1 = require("../users/guards/permissions.guard");
const permissions_decorator_1 = require("../users/decorators/permissions.decorator");
const current_user_decorator_1 = require("../users/decorators/current-user.decorator");
const parties_permission_constants_1 = require("./constants/parties-permission.constants");
let PartiesController = class PartiesController {
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
    async bulkImport(tenantId, actorId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded — attach it under the "file" field.');
        }
        return this.service.bulkImport(tenantId, file.buffer, actorId);
    }
    update(tenantId, actorId, id, dto) {
        return this.service.update(tenantId, id, { ...dto }, actorId);
    }
    async remove(tenantId, actorId, id) {
        await this.service.softDelete(tenantId, id, actorId);
    }
    updateCreditStatus(tenantId, actorId, id, dto) {
        return this.service.updateCreditStatus(tenantId, id, dto, actorId);
    }
    addContact(tenantId, actorId, id, dto) {
        return this.service.addContact(tenantId, id, { ...dto }, actorId);
    }
    updateContact(tenantId, actorId, id, contactId, dto) {
        return this.service.updateContact(tenantId, id, contactId, { ...dto }, actorId);
    }
    async removeContact(tenantId, actorId, id, contactId) {
        await this.service.removeContact(tenantId, id, contactId, actorId);
    }
    addAddress(tenantId, actorId, id, dto) {
        return this.service.addAddress(tenantId, id, { ...dto }, actorId);
    }
    updateAddress(tenantId, actorId, id, addressId, dto) {
        return this.service.updateAddress(tenantId, id, addressId, { ...dto }, actorId);
    }
    async removeAddress(tenantId, actorId, id, addressId) {
        await this.service.removeAddress(tenantId, id, addressId, actorId);
    }
};
exports.PartiesController = PartiesController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'List parties (customers, agents, suppliers, carriers, etc.)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, party_query_dto_1.PartyQueryDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.VIEW),
    (0, swagger_1.ApiOperation)({ summary: 'Get a party with its contacts and addresses' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.CREATE),
    (0, swagger_1.ApiOperation)({ summary: 'Create a party' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, party_dto_1.CreatePartyDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.CREATE),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk-import parties from CSV. Columns match the party fields (party_type, code, name, ...); ' +
            'use "|" to separate multiple tags within a cell. Best-effort: bad rows are reported, good rows still import.',
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, callback) => {
            if (!file.originalname.toLowerCase().endsWith('.csv') && file.mimetype !== 'text/csv') {
                return callback(new common_1.BadRequestException('Only .csv files are accepted.'), false);
            }
            callback(null, true);
        },
    })),
    openapi.ApiResponse({ status: 201, type: require("./dto/party-import-result.dto").PartyImportResultDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PartiesController.prototype, "bulkImport", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Update a party' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, party_dto_1.UpdatePartyDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.DELETE),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a party' }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PartiesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/credit-status'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.MANAGE_CREDIT),
    (0, swagger_1.ApiOperation)({ summary: 'Change credit status (Active / On Hold / Blacklisted)' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_credit_status_dto_1.UpdateCreditStatusDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "updateCreditStatus", null);
__decorate([
    (0, common_1.Post)(':id/contacts'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Add a contact to a party' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, party_contact_dto_1.CreatePartyContactDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "addContact", null);
__decorate([
    (0, common_1.Patch)(':id/contacts/:contactId'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: "Update a party's contact" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, party_contact_dto_1.UpdatePartyContactDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "updateContact", null);
__decorate([
    (0, common_1.Delete)(':id/contacts/:contactId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: "Remove a party's contact" }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('contactId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PartiesController.prototype, "removeContact", null);
__decorate([
    (0, common_1.Post)(':id/addresses'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: 'Add an address to a party' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, party_address_dto_1.CreatePartyAddressDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "addAddress", null);
__decorate([
    (0, common_1.Patch)(':id/addresses/:addressId'),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: "Update a party's address" }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('addressId', common_1.ParseUUIDPipe)),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, party_address_dto_1.UpdatePartyAddressDto]),
    __metadata("design:returntype", void 0)
], PartiesController.prototype, "updateAddress", null);
__decorate([
    (0, common_1.Delete)(':id/addresses/:addressId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, permissions_decorator_1.RequirePermissions)(parties_permission_constants_1.PARTIES_PERMISSIONS.UPDATE),
    (0, swagger_1.ApiOperation)({ summary: "Remove a party's address" }),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Param)('addressId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], PartiesController.prototype, "removeAddress", null);
exports.PartiesController = PartiesController = __decorate([
    (0, swagger_1.ApiTags)('Parties'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('parties'),
    __metadata("design:paramtypes", [parties_service_1.PartiesService])
], PartiesController);
//# sourceMappingURL=parties.controller.js.map
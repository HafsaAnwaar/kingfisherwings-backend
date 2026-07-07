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
exports.UpdateTenantBankAccountDto = exports.CreateTenantBankAccountDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTenantBankAccountDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { bank_name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, account_name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, account_number: { required: true, type: () => String, minLength: 1, maxLength: 50 }, iban: { required: false, type: () => String }, swift_code: { required: false, type: () => String }, currency_code: { required: false, type: () => String, minLength: 3, maxLength: 3 }, branch_id: { required: false, type: () => String }, is_default: { required: false, type: () => Boolean }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateTenantBankAccountDto = CreateTenantBankAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emirates NBD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "bank_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Oceanic Freight Forwarders LLC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "account_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "account_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AE070331234567890123456' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "iban", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EBILAEAD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "swift_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'AED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTenantBankAccountDto.prototype, "branch_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTenantBankAccountDto.prototype, "is_default", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTenantBankAccountDto.prototype, "is_active", void 0);
class UpdateTenantBankAccountDto extends (0, swagger_1.PartialType)(CreateTenantBankAccountDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateTenantBankAccountDto = UpdateTenantBankAccountDto;
//# sourceMappingURL=tenant-bank-account.dto.js.map
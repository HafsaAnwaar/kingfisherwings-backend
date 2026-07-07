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
exports.UpdateChargeCodeDto = exports.CreateChargeCodeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateChargeCodeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String, minLength: 1, maxLength: 20 }, description: { required: true, type: () => String, minLength: 2, maxLength: 200 }, charge_group: { required: false, type: () => Object }, applicable_modes: { required: true, type: () => [String] }, tax_applicable: { required: false, type: () => Boolean }, tax_rate_id: { required: false, type: () => String }, gl_revenue_code: { required: false, type: () => String }, gl_cost_code: { required: false, type: () => String }, unit: { required: false, type: () => String }, is_mandatory: { required: false, type: () => Boolean }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateChargeCodeDto = CreateChargeCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OFT' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ocean Freight' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ChargeGroup, default: client_1.ChargeGroup.OTHER }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ChargeGroup),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "charge_group", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], example: ['SEA', 'AIR'], description: 'ShipmentMode values this charge applies to.' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateChargeCodeDto.prototype, "applicable_modes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChargeCodeDto.prototype, "tax_applicable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "tax_rate_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '4001', description: 'Revenue GL account code (placeholder until GL module exists).' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "gl_revenue_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '5001', description: 'Cost GL account code (placeholder until GL module exists).' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "gl_cost_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Per Container' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChargeCodeDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChargeCodeDto.prototype, "is_mandatory", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateChargeCodeDto.prototype, "is_active", void 0);
class UpdateChargeCodeDto extends (0, swagger_1.PartialType)(CreateChargeCodeDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateChargeCodeDto = UpdateChargeCodeDto;
//# sourceMappingURL=charge-code.dto.js.map
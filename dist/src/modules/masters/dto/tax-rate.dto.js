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
exports.UpdateTaxRateDto = exports.CreateTaxRateDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateTaxRateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2, maxLength: 100 }, code: { required: true, type: () => String, minLength: 1, maxLength: 20 }, tax_type: { required: false, type: () => Object }, rate: { required: true, type: () => Number, minimum: 0, maximum: 100 }, country_code: { required: true, type: () => String, minLength: 2, maxLength: 2 }, effective_from: { required: true, type: () => String }, effective_to: { required: false, type: () => String }, is_default: { required: false, type: () => Boolean }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateTaxRateDto = CreateTaxRateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UAE VAT Standard' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VAT5' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TaxType, default: client_1.TaxType.VAT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TaxType),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "tax_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'Percent' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTaxRateDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2018-01-01' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "effective_from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2030-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaxRateDto.prototype, "effective_to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false, description: 'Auto-applied rate for this country when none is specified.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaxRateDto.prototype, "is_default", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaxRateDto.prototype, "is_active", void 0);
class UpdateTaxRateDto extends (0, swagger_1.PartialType)(CreateTaxRateDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateTaxRateDto = UpdateTaxRateDto;
//# sourceMappingURL=tax-rate.dto.js.map
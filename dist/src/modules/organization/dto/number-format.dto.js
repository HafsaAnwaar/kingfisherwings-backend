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
exports.UpdateNumberFormatDto = exports.CreateNumberFormatDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateNumberFormatDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { document_type: { required: true, type: () => Object }, prefix: { required: true, type: () => String, minLength: 1, maxLength: 20 }, include_branch_code: { required: false, type: () => Boolean }, include_year: { required: false, type: () => Boolean }, year_digits: { required: false, type: () => Number, minimum: 2, maximum: 4 }, include_month: { required: false, type: () => Boolean }, sequence_length: { required: false, type: () => Number, minimum: 3, maximum: 10 }, separator: { required: false, type: () => String, minLength: 0, maxLength: 3 }, reset_frequency: { required: false, type: () => Object }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateNumberFormatDto = CreateNumberFormatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.DocumentNumberType }),
    (0, class_validator_1.IsEnum)(client_1.DocumentNumberType),
    __metadata("design:type", String)
], CreateNumberFormatDto.prototype, "document_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'KFW' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateNumberFormatDto.prototype, "prefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNumberFormatDto.prototype, "include_branch_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNumberFormatDto.prototype, "include_year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 2, description: '2 or 4 digit year' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(4),
    __metadata("design:type", Number)
], CreateNumberFormatDto.prototype, "year_digits", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNumberFormatDto.prototype, "include_month", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 5, minimum: 3, maximum: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreateNumberFormatDto.prototype, "sequence_length", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: '/' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(0, 3),
    __metadata("design:type", String)
], CreateNumberFormatDto.prototype, "separator", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.DocumentNumberResetFrequency, default: client_1.DocumentNumberResetFrequency.YEARLY }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.DocumentNumberResetFrequency),
    __metadata("design:type", String)
], CreateNumberFormatDto.prototype, "reset_frequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateNumberFormatDto.prototype, "is_active", void 0);
class UpdateNumberFormatDto extends (0, swagger_1.PartialType)(CreateNumberFormatDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateNumberFormatDto = UpdateNumberFormatDto;
//# sourceMappingURL=number-format.dto.js.map
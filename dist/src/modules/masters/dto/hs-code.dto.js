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
exports.UpdateHsCodeDto = exports.CreateHsCodeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateHsCodeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { hs_code: { required: true, type: () => String, minLength: 4, maxLength: 12 }, description: { required: true, type: () => String, minLength: 2, maxLength: 500 }, import_duty_rate: { required: false, type: () => Number, minimum: 0, maximum: 100 }, export_duty_rate: { required: false, type: () => Number, minimum: 0, maximum: 100 }, dg_class: { required: false, type: () => String }, un_number: { required: false, type: () => String }, is_prohibited: { required: false, type: () => Boolean }, is_restricted: { required: false, type: () => Boolean }, notes: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateHsCodeDto = CreateHsCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '8517.12' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 12),
    __metadata("design:type", String)
], CreateHsCodeDto.prototype, "hs_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Telephones for cellular networks' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 500),
    __metadata("design:type", String)
], CreateHsCodeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateHsCodeDto.prototype, "import_duty_rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Percent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateHsCodeDto.prototype, "export_duty_rate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '9', description: 'IMDG/DG class' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHsCodeDto.prototype, "dg_class", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'UN3481' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHsCodeDto.prototype, "un_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHsCodeDto.prototype, "is_prohibited", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHsCodeDto.prototype, "is_restricted", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateHsCodeDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHsCodeDto.prototype, "is_active", void 0);
class UpdateHsCodeDto extends (0, swagger_1.PartialType)(CreateHsCodeDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateHsCodeDto = UpdateHsCodeDto;
//# sourceMappingURL=hs-code.dto.js.map
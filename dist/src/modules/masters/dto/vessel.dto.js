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
exports.UpdateVesselDto = exports.CreateVesselDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateVesselDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, imo_number: { required: false, type: () => String }, flag_country: { required: false, type: () => String, minLength: 2, maxLength: 2 }, shipping_line_id: { required: false, type: () => String }, vessel_type: { required: false, type: () => String }, year_built: { required: false, type: () => Number, minimum: 1900, maximum: 2100 }, gross_tonnage: { required: false, type: () => Number, minimum: 0 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateVesselDto = CreateVesselDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MSC GULSUN' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateVesselDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '9839430' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVesselDto.prototype, "imo_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'PA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateVesselDto.prototype, "flag_country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVesselDto.prototype, "shipping_line_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Container Ship' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVesselDto.prototype, "vessel_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2019 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1900),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], CreateVesselDto.prototype, "year_built", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gross tonnage' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVesselDto.prototype, "gross_tonnage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVesselDto.prototype, "is_active", void 0);
class UpdateVesselDto extends (0, swagger_1.PartialType)(CreateVesselDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateVesselDto = UpdateVesselDto;
//# sourceMappingURL=vessel.dto.js.map
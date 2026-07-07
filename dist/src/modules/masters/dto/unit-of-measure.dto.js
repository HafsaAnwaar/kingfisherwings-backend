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
exports.UpdateUnitOfMeasureDto = exports.CreateUnitOfMeasureDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateUnitOfMeasureDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String, minLength: 1, maxLength: 20 }, name: { required: true, type: () => String, minLength: 2, maxLength: 100 }, category: { required: true, type: () => String, minLength: 2, maxLength: 50 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateUnitOfMeasureDto = CreateUnitOfMeasureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CBM' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateUnitOfMeasureDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cubic Meter' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateUnitOfMeasureDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Volume', description: 'e.g. Weight, Volume, Length, Count' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 50),
    __metadata("design:type", String)
], CreateUnitOfMeasureDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUnitOfMeasureDto.prototype, "is_active", void 0);
class UpdateUnitOfMeasureDto extends (0, swagger_1.PartialType)(CreateUnitOfMeasureDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateUnitOfMeasureDto = UpdateUnitOfMeasureDto;
//# sourceMappingURL=unit-of-measure.dto.js.map
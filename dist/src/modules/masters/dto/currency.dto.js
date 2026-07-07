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
exports.UpdateCurrencyDto = exports.CreateCurrencyDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateCurrencyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String, minLength: 3, maxLength: 3 }, name: { required: true, type: () => String, minLength: 2, maxLength: 100 }, symbol: { required: true, type: () => String, minLength: 1, maxLength: 10 }, decimal_places: { required: false, type: () => Number, minimum: 0, maximum: 6 }, is_base: { required: false, type: () => Boolean }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateCurrencyDto = CreateCurrencyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AED', description: 'ISO 4217' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UAE Dirham' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'د.إ' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10),
    __metadata("design:type", String)
], CreateCurrencyDto.prototype, "symbol", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 2, minimum: 0, maximum: 6 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], CreateCurrencyDto.prototype, "decimal_places", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false, description: "This tenant's reporting/base currency." }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCurrencyDto.prototype, "is_base", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCurrencyDto.prototype, "is_active", void 0);
class UpdateCurrencyDto extends (0, swagger_1.PartialType)(CreateCurrencyDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateCurrencyDto = UpdateCurrencyDto;
//# sourceMappingURL=currency.dto.js.map
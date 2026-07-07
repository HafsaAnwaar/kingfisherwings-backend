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
exports.CreateExchangeRateDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateExchangeRateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { currency_id: { required: true, type: () => String }, base_currency: { required: true, type: () => String, minLength: 3, maxLength: 3 }, rate: { required: true, type: () => Number, minimum: 0 }, rate_date: { required: true, type: () => String }, source: { required: false, type: () => String } };
    }
}
exports.CreateExchangeRateDto = CreateExchangeRateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ format: 'uuid', description: 'Currency being rated against the base currency.' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "currency_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "base_currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3.6725 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateExchangeRateDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-07-06' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "rate_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'manual', description: 'e.g. "xe.com" or "manual".' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExchangeRateDto.prototype, "source", void 0);
//# sourceMappingURL=exchange-rate.dto.js.map
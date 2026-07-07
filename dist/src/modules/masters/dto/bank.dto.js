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
exports.UpdateBankDto = exports.CreateBankDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateBankDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, short_name: { required: false, type: () => String }, swift_code: { required: false, type: () => String }, iban_prefix: { required: false, type: () => String }, country_code: { required: false, type: () => String, minLength: 2, maxLength: 2 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateBankDto = CreateBankDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emirates NBD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateBankDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ENBD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankDto.prototype, "short_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EBILAEAD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankDto.prototype, "swift_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AE07' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBankDto.prototype, "iban_prefix", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateBankDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateBankDto.prototype, "is_active", void 0);
class UpdateBankDto extends (0, swagger_1.PartialType)(CreateBankDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateBankDto = UpdateBankDto;
//# sourceMappingURL=bank.dto.js.map
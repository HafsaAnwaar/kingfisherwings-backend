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
exports.UpdateShippingLineDto = exports.CreateShippingLineDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateShippingLineDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { scac_code: { required: true, type: () => String, minLength: 2, maxLength: 10 }, name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, short_name: { required: false, type: () => String }, country_code: { required: false, type: () => String, minLength: 2, maxLength: 2 }, website: { required: false, type: () => String }, tracking_url: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateShippingLineDto = CreateShippingLineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MAEU', description: 'SCAC code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "scac_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Maersk Line' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Maersk' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "short_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'DK' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://www.maersk.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Container tracking URL template.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShippingLineDto.prototype, "tracking_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateShippingLineDto.prototype, "is_active", void 0);
class UpdateShippingLineDto extends (0, swagger_1.PartialType)(CreateShippingLineDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateShippingLineDto = UpdateShippingLineDto;
//# sourceMappingURL=shipping-line.dto.js.map
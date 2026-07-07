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
exports.UpdateAirlineDto = exports.CreateAirlineDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAirlineDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { iata_code: { required: true, type: () => String, minLength: 2, maxLength: 2 }, icao_code: { required: false, type: () => String, minLength: 3, maxLength: 3 }, prefix_code: { required: false, type: () => String, minLength: 3, maxLength: 3 }, name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, country_code: { required: false, type: () => String, minLength: 2, maxLength: 2 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateAirlineDto = CreateAirlineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EK', description: 'IATA 2-letter code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateAirlineDto.prototype, "iata_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'UAE', description: 'ICAO 3-letter code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateAirlineDto.prototype, "icao_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '176', description: '3-digit AWB prefix' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateAirlineDto.prototype, "prefix_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Emirates' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateAirlineDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateAirlineDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAirlineDto.prototype, "is_active", void 0);
class UpdateAirlineDto extends (0, swagger_1.PartialType)(CreateAirlineDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateAirlineDto = UpdateAirlineDto;
//# sourceMappingURL=airline.dto.js.map
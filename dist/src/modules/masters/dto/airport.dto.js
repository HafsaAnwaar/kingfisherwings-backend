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
exports.UpdateAirportDto = exports.CreateAirportDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAirportDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { iata_code: { required: true, type: () => String, minLength: 3, maxLength: 3 }, icao_code: { required: false, type: () => String, minLength: 4, maxLength: 4 }, name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, city: { required: false, type: () => String }, country_code: { required: true, type: () => String, minLength: 2, maxLength: 2 }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, timezone: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateAirportDto = CreateAirportDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DXB', description: 'IATA code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "iata_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'OMDB', description: 'ICAO code' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 4),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "icao_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Dubai International Airport' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dubai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], CreateAirportDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], CreateAirportDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Asia/Dubai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAirportDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAirportDto.prototype, "is_active", void 0);
class UpdateAirportDto extends (0, swagger_1.PartialType)(CreateAirportDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateAirportDto = UpdateAirportDto;
//# sourceMappingURL=airport.dto.js.map
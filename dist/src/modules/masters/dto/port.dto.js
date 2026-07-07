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
exports.UpdatePortDto = exports.CreatePortDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreatePortDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { un_locode: { required: true, type: () => String, minLength: 5, maxLength: 10 }, name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, city: { required: false, type: () => String }, country_code: { required: true, type: () => String, minLength: 2, maxLength: 2 }, mode: { required: false, type: () => Object }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreatePortDto = CreatePortDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AEJEA', description: 'UN/LOCODE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(5, 10),
    __metadata("design:type", String)
], CreatePortDto.prototype, "un_locode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jebel Ali' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreatePortDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dubai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreatePortDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ShipmentMode, default: client_1.ShipmentMode.SEA }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ShipmentMode),
    __metadata("design:type", String)
], CreatePortDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLatitude)(),
    __metadata("design:type", Number)
], CreatePortDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsLongitude)(),
    __metadata("design:type", Number)
], CreatePortDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePortDto.prototype, "is_active", void 0);
class UpdatePortDto extends (0, swagger_1.PartialType)(CreatePortDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdatePortDto = UpdatePortDto;
//# sourceMappingURL=port.dto.js.map
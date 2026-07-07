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
exports.UpdateContainerTypeDto = exports.CreateContainerTypeDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateContainerTypeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { code: { required: true, type: () => String, minLength: 1, maxLength: 20 }, name: { required: true, type: () => String, minLength: 2, maxLength: 100 }, size: { required: true, type: () => Object }, teu: { required: false, type: () => Number, minimum: 0 }, max_payload: { required: false, type: () => Number, minimum: 0 }, volume_cbm: { required: false, type: () => Number, minimum: 0 }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreateContainerTypeDto = CreateContainerTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '40HC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 20),
    __metadata("design:type", String)
], CreateContainerTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '40ft High Cube' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    __metadata("design:type", String)
], CreateContainerTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.ContainerSize }),
    (0, class_validator_1.IsEnum)(client_1.ContainerSize),
    __metadata("design:type", String)
], CreateContainerTypeDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1, description: 'Twenty-foot equivalent units' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateContainerTypeDto.prototype, "teu", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Max payload in kg' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateContainerTypeDto.prototype, "max_payload", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Internal volume in CBM' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateContainerTypeDto.prototype, "volume_cbm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateContainerTypeDto.prototype, "is_active", void 0);
class UpdateContainerTypeDto extends (0, swagger_1.PartialType)(CreateContainerTypeDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateContainerTypeDto = UpdateContainerTypeDto;
//# sourceMappingURL=container-type.dto.js.map
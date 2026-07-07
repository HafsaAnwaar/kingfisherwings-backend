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
exports.UpdatePartyDto = exports.CreatePartyDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreatePartyDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { party_type: { required: true, type: () => Object }, code: { required: true, type: () => String, minLength: 1, maxLength: 30 }, name: { required: true, type: () => String, minLength: 2, maxLength: 300 }, short_name: { required: false, type: () => String }, vat_number: { required: false, type: () => String }, cr_number: { required: false, type: () => String }, country_code: { required: false, type: () => String, minLength: 2, maxLength: 2 }, city: { required: false, type: () => String }, address: { required: false, type: () => String }, phone: { required: false, type: () => String }, email: { required: false, type: () => String }, credit_limit: { required: false, type: () => Number, minimum: 0 }, credit_days: { required: false, type: () => Number, minimum: 0, maximum: 365 }, currency_code: { required: false, type: () => String, minLength: 3, maxLength: 3 }, salesperson_id: { required: false, type: () => String }, portal_access: { required: false, type: () => Boolean }, marketing_subscription: { required: false, type: () => Boolean }, iata_code: { required: false, type: () => String }, scac_code: { required: false, type: () => String }, tags: { required: false, type: () => [String] }, notes: { required: false, type: () => String }, is_active: { required: false, type: () => Boolean } };
    }
}
exports.CreatePartyDto = CreatePartyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PartyType }),
    (0, class_validator_1.IsEnum)(client_1.PartyType),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "party_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CUST-001' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 30),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Al Noor Trading LLC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 300),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Al Noor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "short_name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "vat_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "cr_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Dubai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+971501234567' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePartyDto.prototype, "credit_limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(365),
    __metadata("design:type", Number)
], CreatePartyDto.prototype, "credit_days", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'AED' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 3),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "currency_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ format: 'uuid', description: 'User this party is assigned to.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "salesperson_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartyDto.prototype, "portal_access", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartyDto.prototype, "marketing_subscription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EK', description: 'For airline-type parties.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "iata_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'MAEU', description: 'For shipping-line-type parties.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "scac_code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePartyDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartyDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePartyDto.prototype, "is_active", void 0);
class UpdatePartyDto extends (0, swagger_1.PartialType)(CreatePartyDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdatePartyDto = UpdatePartyDto;
//# sourceMappingURL=party.dto.js.map
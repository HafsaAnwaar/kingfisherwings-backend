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
exports.UpdateHolidayDto = exports.CreateHolidayDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateHolidayDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { country_code: { required: true, type: () => String, minLength: 2, maxLength: 2 }, date: { required: true, type: () => String }, name: { required: true, type: () => String, minLength: 2, maxLength: 200 }, is_recurring: { required: false, type: () => Boolean } };
    }
}
exports.CreateHolidayDto = CreateHolidayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AE' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 2),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "country_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-12-02' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'UAE National Day' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateHolidayDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false, description: 'Recurs on the same date every year.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateHolidayDto.prototype, "is_recurring", void 0);
class UpdateHolidayDto extends (0, swagger_1.PartialType)(CreateHolidayDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateHolidayDto = UpdateHolidayDto;
//# sourceMappingURL=holiday.dto.js.map
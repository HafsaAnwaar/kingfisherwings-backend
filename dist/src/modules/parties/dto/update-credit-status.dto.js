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
exports.UpdateCreditStatusDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class UpdateCreditStatusDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { credit_status: { required: true, type: () => Object }, reason: { required: false, type: () => String, maxLength: 255 } };
    }
}
exports.UpdateCreditStatusDto = UpdateCreditStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PartyCreditStatus }),
    (0, class_validator_1.IsEnum)(client_1.PartyCreditStatus),
    __metadata("design:type", String)
], UpdateCreditStatusDto.prototype, "credit_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Recorded for audit purposes, e.g. "Overdue 90+ days".' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateCreditStatusDto.prototype, "reason", void 0);
//# sourceMappingURL=update-credit-status.dto.js.map
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
exports.ChangePasswordDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const password_validator_1 = require("../validators/password.validator");
class ChangePasswordDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { current_password: { required: true, type: () => String, minLength: 1 }, new_password: { required: true, type: () => String }, confirm_password: { required: true, type: () => String } };
    }
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: "User's current password." }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "current_password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New password meeting the platform strength policy.' }),
    (0, class_validator_1.IsString)(),
    (0, password_validator_1.IsStrongPassword)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "new_password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Must match new_password.' }),
    (0, class_validator_1.IsString)(),
    (0, password_validator_1.Match)('new_password'),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "confirm_password", void 0);
//# sourceMappingURL=change-password.dto.js.map
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
exports.BulkUserDto = exports.BulkUserAction = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var BulkUserAction;
(function (BulkUserAction) {
    BulkUserAction["ACTIVATE"] = "ACTIVATE";
    BulkUserAction["DEACTIVATE"] = "DEACTIVATE";
    BulkUserAction["SUSPEND"] = "SUSPEND";
    BulkUserAction["DELETE"] = "DELETE";
    BulkUserAction["RESTORE"] = "RESTORE";
})(BulkUserAction || (exports.BulkUserAction = BulkUserAction = {}));
class BulkUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { ids: { required: true, type: () => [String] }, action: { required: true, enum: require("./bulk-user.dto").BulkUserAction } };
    }
}
exports.BulkUserDto = BulkUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String], format: 'uuid', minItems: 1 }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], BulkUserDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: BulkUserAction }),
    (0, class_validator_1.IsEnum)(BulkUserAction),
    __metadata("design:type", String)
], BulkUserDto.prototype, "action", void 0);
//# sourceMappingURL=bulk-user.dto.js.map
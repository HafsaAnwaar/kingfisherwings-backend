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
exports.PartyImportResultDto = exports.ImportRowError = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class ImportRowError {
    static _OPENAPI_METADATA_FACTORY() {
        return { row: { required: true, type: () => Number }, code: { required: false, type: () => String }, message: { required: true, type: () => String } };
    }
}
exports.ImportRowError = ImportRowError;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '1-indexed data row number (header row not counted).' }),
    __metadata("design:type", Number)
], ImportRowError.prototype, "row", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    __metadata("design:type", String)
], ImportRowError.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ImportRowError.prototype, "message", void 0);
class PartyImportResultDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { total: { required: true, type: () => Number }, imported: { required: true, type: () => Number }, failed: { required: true, type: () => Number }, createdIds: { required: true, type: () => [String] }, errors: { required: true, type: () => [require("./party-import-result.dto").ImportRowError] } };
    }
}
exports.PartyImportResultDto = PartyImportResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PartyImportResultDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PartyImportResultDto.prototype, "imported", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PartyImportResultDto.prototype, "failed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], PartyImportResultDto.prototype, "createdIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ImportRowError] }),
    __metadata("design:type", Array)
], PartyImportResultDto.prototype, "errors", void 0);
//# sourceMappingURL=party-import-result.dto.js.map
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
exports.PaginatedUsersResponse = exports.PaginationMetaResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const user_response_1 = require("./user.response");
class PaginationMetaResponse {
}
exports.PaginationMetaResponse = PaginationMetaResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMetaResponse.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMetaResponse.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMetaResponse.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginationMetaResponse.prototype, "totalPages", void 0);
class PaginatedUsersResponse {
}
exports.PaginatedUsersResponse = PaginatedUsersResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [user_response_1.UserResponse] }),
    __metadata("design:type", Array)
], PaginatedUsersResponse.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: PaginationMetaResponse }),
    __metadata("design:type", PaginationMetaResponse)
], PaginatedUsersResponse.prototype, "meta", void 0);
//# sourceMappingURL=paginated-users.response.js.map
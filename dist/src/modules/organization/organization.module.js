"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const organization_controller_1 = require("./organization.controller");
const organization_service_1 = require("./organization.service");
const bank_accounts_controller_1 = require("./bank-accounts/bank-accounts.controller");
const bank_accounts_service_1 = require("./bank-accounts/bank-accounts.service");
const number_formats_controller_1 = require("./number-formats/number-formats.controller");
const number_formats_service_1 = require("./number-formats/number-formats.service");
const number_generator_service_1 = require("./number-formats/number-generator.service");
let OrganizationModule = class OrganizationModule {
};
exports.OrganizationModule = OrganizationModule;
exports.OrganizationModule = OrganizationModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [organization_controller_1.OrganizationController, bank_accounts_controller_1.BankAccountsController, number_formats_controller_1.NumberFormatsController],
        providers: [organization_service_1.OrganizationService, bank_accounts_service_1.BankAccountsService, number_formats_service_1.NumberFormatsService, number_generator_service_1.NumberGeneratorService],
        exports: [number_generator_service_1.NumberGeneratorService, organization_service_1.OrganizationService, bank_accounts_service_1.BankAccountsService],
    })
], OrganizationModule);
//# sourceMappingURL=organization.module.js.map
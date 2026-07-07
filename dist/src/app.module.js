"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const health_module_1 = require("./health/health.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const users_1 = require("./modules/users");
const auth_module_1 = require("./modules/auth/auth.module");
const masters_module_1 = require("./modules/masters/masters.module");
const parties_module_1 = require("./modules/parties/parties.module");
const organization_module_1 = require("./modules/organization/organization.module");
const tenant_context_storage_1 = require("./common/context/tenant-context.storage");
const tenant_context_interceptor_1 = require("./common/interceptors/tenant-context.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            health_module_1.HealthModule,
            tenants_module_1.TenantsModule,
            users_1.UsersModule,
            auth_module_1.AuthModule,
            masters_module_1.MastersModule,
            parties_module_1.PartiesModule,
            organization_module_1.OrganizationModule,
        ],
        providers: [
            tenant_context_storage_1.TenantContextStorage,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_context_interceptor_1.TenantContextInterceptor,
            },
        ],
        exports: [tenant_context_storage_1.TenantContextStorage],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
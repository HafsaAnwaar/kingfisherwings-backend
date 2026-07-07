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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    constructor(configService, prisma) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_SECRET'),
        });
        this.configService = configService;
        this.prisma = prisma;
    }
    async validate(payload) {
        if (payload.type !== 'access') {
            throw new common_1.UnauthorizedException('Invalid token type.');
        }
        if (payload.principal === 'super_admin') {
            return this.validateSuperAdmin(payload);
        }
        return this.validateUser(payload);
    }
    async validateUser(payload) {
        const session = await this.prisma.session.findUnique({
            where: { jti: payload.sessionId },
            include: { user: true },
        });
        if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Session is no longer valid.');
        }
        if (!session.user || session.user.deleted_at || session.user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('Account is no longer active.');
        }
        return {
            id: payload.sub,
            tenantId: payload.tenantId,
            branchId: payload.branchId,
            roleId: payload.roleId,
            role: payload.role,
            sessionId: payload.sessionId,
            email: payload.email,
            permissions: payload.permissions,
        };
    }
    async validateSuperAdmin(payload) {
        const session = await this.prisma.superAdminSession.findUnique({
            where: { jti: payload.sessionId },
            include: { super_admin: true },
        });
        if (!session || !session.is_active || session.revoked_at || session.expires_at < new Date()) {
            throw new common_1.UnauthorizedException('Session is no longer valid.');
        }
        if (!session.super_admin || session.super_admin.deleted_at || !session.super_admin.is_active) {
            throw new common_1.UnauthorizedException('Account is no longer active.');
        }
        return {
            principal: 'super_admin',
            id: payload.sub,
            email: payload.email,
            sessionId: payload.sessionId,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map
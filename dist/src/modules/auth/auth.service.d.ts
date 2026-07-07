import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ChangePasswordDto } from '../users/dto/change-password.dto';
import { TenantChangePasswordDto } from './dto/tenant-change-password.dto';
import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { SuperAdminSignupDto } from './dto/super-admin-signup.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginMeta } from './interfaces/login-meta.interface';
import { RequestPrincipal } from './interfaces/request-with-user.interface';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, usersService: UsersService);
    login(dto: LoginDto, meta: LoginMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
            must_change_password: boolean;
            user: import("../users").UserResponse;
        };
    }>;
    tenantLogin(dto: TenantLoginDto, meta: LoginMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
            must_change_password: boolean;
            user: import("../users").UserResponse;
        };
    }>;
    superAdminSignup(dto: SuperAdminSignupDto, meta: LoginMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
            super_admin: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
        };
    }>;
    superAdminLogin(dto: SuperAdminLoginDto, meta: LoginMeta): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
            super_admin: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
        };
    }>;
    private completeSuperAdminLogin;
    refresh(dto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
        };
    }>;
    private refreshUser;
    private refreshSuperAdmin;
    logout(principal: RequestPrincipal): Promise<{
        success: boolean;
        message: string;
    }>;
    me(principal: RequestPrincipal): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
        };
    } | {
        success: boolean;
        data: import("../users").UserResponse;
    }>;
    changePassword(tenantId: string, userId: string, dto: ChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    changeTenantPassword(tenantId: string, dto: TenantChangePasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    private assertTenantActive;
    private completeUserLogin;
    private resolveRbac;
    private issueUserTokens;
    private issueSuperAdminTokens;
    private signTokenPair;
    private handleFailedUserLogin;
    private enforceSessionLimit;
    private enforceSingleDeviceLogin;
    listSessions(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            created_at: Date;
            jti: string;
            ip_address: string | null;
            device_name: string | null;
            browser: string | null;
            operating_system: string | null;
            remember_me: boolean;
            expires_at: Date;
            last_used_at: Date;
        }[];
    }>;
    revokeSession(userId: string, sessionId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private recordLoginHistory;
}

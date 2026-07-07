import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { SuperAdminSignupDto } from './dto/super-admin-signup.dto';
import { SuperAdminLoginDto } from './dto/super-admin-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TenantChangePasswordDto } from './dto/tenant-change-password.dto';
import { RequestWithUser } from './interfaces/request-with-user.interface';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request): Promise<{
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
    tenantLogin(dto: TenantLoginDto, req: Request): Promise<{
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
    superAdminSignup(dto: SuperAdminSignupDto, req: Request): Promise<{
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
    superAdminLogin(dto: SuperAdminLoginDto, req: Request): Promise<{
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
    refresh(dto: RefreshTokenDto): Promise<{
        success: boolean;
        message: string;
        data: {
            access_token: string;
            refresh_token: string;
            expires_in: string;
        };
    }>;
    logout(req: RequestWithUser): Promise<{
        success: boolean;
        message: string;
    }>;
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
    me(req: RequestWithUser): Promise<{
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
    private extractMeta;
}

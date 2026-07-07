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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const password_util_1 = require("../../common/utils/password.util");
const permission_catalog_1 = require("../../common/constants/permission-catalog");
const role_catalog_1 = require("../../common/constants/role-catalog");
const rls_util_1 = require("../../common/utils/rls.util");
const user_mapper_1 = require("../users/mappers/user.mapper");
const OWNER_ROLE_CODE = 'TENANT_ADMIN';
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTenantDto, createdBySuperAdminId) {
        await this.validateUniqueFields(createTenantDto);
        const { password, admin_first_name, admin_last_name, ...tenantData } = createTenantDto;
        const passwordHash = await password_util_1.PasswordUtil.hash(password);
        const result = await this.prisma.$transaction(async (tx) => {
            const tenantCreateData = {
                ...tenantData,
                password_hash: passwordHash,
                created_by_super_admin_id: createdBySuperAdminId,
            };
            const tenant = await tx.tenant.create({
                data: tenantCreateData,
            });
            await tx.$executeRaw((0, rls_util_1.setTenantContextQuery)(tenant.id));
            const permissions = await Promise.all(permission_catalog_1.PERMISSION_CATALOG.map((entry) => tx.permission.create({
                data: {
                    tenant_id: tenant.id,
                    module: entry.module,
                    action: entry.action,
                    description: entry.description,
                },
            })));
            const permissionsByCode = new Map(permissions.map((permission) => [`${permission.module}.${permission.action}`, permission]));
            const rolesByCode = new Map();
            for (const roleEntry of role_catalog_1.ROLE_CATALOG) {
                const role = await tx.role.create({
                    data: {
                        tenant_id: tenant.id,
                        code: roleEntry.code,
                        name: roleEntry.name,
                        is_system: true,
                        is_default: roleEntry.isDefault ?? false,
                        is_active: true,
                    },
                });
                rolesByCode.set(roleEntry.code, role);
                if (roleEntry.permissions.length > 0) {
                    await tx.rolePermission.createMany({
                        data: roleEntry.permissions.map((code) => ({
                            tenant_id: tenant.id,
                            role_id: role.id,
                            permission_id: permissionsByCode.get(code).id,
                        })),
                    });
                }
            }
            const ownerRole = rolesByCode.get(OWNER_ROLE_CODE);
            const owner = await tx.user.create({
                data: {
                    tenant_id: tenant.id,
                    email: tenantData.email.toLowerCase(),
                    password_hash: passwordHash,
                    password_changed_at: new Date(),
                    must_change_password: false,
                    first_name: admin_first_name ?? 'Tenant',
                    last_name: admin_last_name ?? 'Admin',
                    role: 'TENANT_ADMIN',
                    status: 'ACTIVE',
                    email_verified: true,
                    email_verified_at: new Date(),
                    created_by_tenant_id: tenant.id,
                },
            });
            await tx.userRoleAssignment.create({
                data: { tenant_id: tenant.id, user_id: owner.id, role_id: ownerRole.id },
            });
            await tx.passwordHistory.create({
                data: {
                    tenant_id: tenant.id,
                    user_id: owner.id,
                    password_hash: passwordHash,
                    changed_by: createdBySuperAdminId,
                    reason: 'INITIAL_PASSWORD',
                },
            });
            return { tenant, owner };
        });
        return {
            success: true,
            message: 'Tenant created successfully. Log in at POST /auth/tenant-login with the password you set.',
            data: {
                tenant: this.sanitizeTenant(result.tenant),
                owner: user_mapper_1.UserMapper.toResponse(result.owner),
            },
        };
    }
    async findAll(query) {
        const { page = 1, limit = 10, search, sortBy = 'created_at', order = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {
            deleted_at: null,
        };
        if (search) {
            where.OR = [
                {
                    code: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    display_name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    slug: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }
        const [tenants, total] = await this.prisma.$transaction([
            this.prisma.tenant.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: order,
                },
            }),
            this.prisma.tenant.count({
                where,
            }),
        ]);
        return {
            success: true,
            data: tenants.map((tenant) => this.sanitizeTenant(tenant)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        return {
            success: true,
            data: this.sanitizeTenant(tenant),
        };
    }
    async update(id, updateTenantDto) {
        const existingTenant = await this.prisma.tenant.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!existingTenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        if (updateTenantDto.code &&
            updateTenantDto.code !== existingTenant.code) {
            const duplicate = await this.prisma.tenant.findFirst({
                where: {
                    code: updateTenantDto.code,
                    id: {
                        not: id,
                    },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException('Tenant code already exists.');
            }
        }
        if (updateTenantDto.slug &&
            updateTenantDto.slug !== existingTenant.slug) {
            const duplicate = await this.prisma.tenant.findFirst({
                where: {
                    slug: updateTenantDto.slug,
                    id: {
                        not: id,
                    },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException('Tenant slug already exists.');
            }
        }
        if (updateTenantDto.domain &&
            updateTenantDto.domain !== existingTenant.domain) {
            const duplicate = await this.prisma.tenant.findFirst({
                where: {
                    domain: updateTenantDto.domain,
                    id: {
                        not: id,
                    },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException('Tenant domain already exists.');
            }
        }
        if (updateTenantDto.email &&
            updateTenantDto.email !== existingTenant.email) {
            const duplicate = await this.prisma.tenant.findFirst({
                where: {
                    email: updateTenantDto.email,
                    id: {
                        not: id,
                    },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException('Tenant email already exists.');
            }
        }
        if ('password' in updateTenantDto) {
            throw new common_1.BadRequestException('Tenant password cannot be changed via PATCH /tenants/:id.');
        }
        const updatedTenant = await this.prisma.$transaction(async (tx) => {
            return tx.tenant.update({
                where: {
                    id,
                },
                data: {
                    ...updateTenantDto,
                },
            });
        });
        return {
            success: true,
            message: 'Tenant updated successfully.',
            data: this.sanitizeTenant(updatedTenant),
        };
    }
    async remove(id) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.tenant.update({
                where: {
                    id,
                },
                data: {
                    deleted_at: new Date(),
                    is_active: false,
                    status: client_1.TenantStatus.ARCHIVED,
                },
            });
        });
        return {
            success: true,
            message: 'Tenant deleted successfully.',
        };
    }
    async restore(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        if (!tenant.deleted_at) {
            throw new common_1.BadRequestException('Tenant is already active.');
        }
        const restored = await this.prisma.tenant.update({
            where: { id },
            data: {
                deleted_at: null,
                is_active: true,
                status: client_1.TenantStatus.ACTIVE,
            },
        });
        return {
            success: true,
            message: 'Tenant restored successfully.',
            data: this.sanitizeTenant(restored),
        };
    }
    async activate(id) {
        await this.ensureTenantExists(id);
        const tenant = await this.prisma.tenant.update({
            where: {
                id,
            },
            data: {
                is_active: true,
                status: client_1.TenantStatus.ACTIVE,
            },
        });
        return {
            success: true,
            message: 'Tenant activated successfully.',
            data: this.sanitizeTenant(tenant),
        };
    }
    async deactivate(id) {
        await this.ensureTenantExists(id);
        const tenant = await this.prisma.tenant.update({
            where: {
                id,
            },
            data: {
                is_active: false,
                status: client_1.TenantStatus.SUSPENDED,
            },
        });
        return {
            success: true,
            message: 'Tenant deactivated successfully.',
            data: this.sanitizeTenant(tenant),
        };
    }
    async statistics() {
        const [total, active, inactive, trial, expired, archived,] = await Promise.all([
            this.prisma.tenant.count(),
            this.prisma.tenant.count({
                where: {
                    status: client_1.TenantStatus.ACTIVE,
                },
            }),
            this.prisma.tenant.count({
                where: {
                    is_active: false,
                },
            }),
            this.prisma.tenant.count({
                where: {
                    status: client_1.TenantStatus.TRIAL,
                },
            }),
            this.prisma.tenant.count({
                where: {
                    status: client_1.TenantStatus.EXPIRED,
                },
            }),
            this.prisma.tenant.count({
                where: {
                    status: client_1.TenantStatus.ARCHIVED,
                },
            }),
        ]);
        return {
            success: true,
            data: {
                total,
                active,
                inactive,
                trial,
                expired,
                archived,
            },
        };
    }
    sanitizeTenant(tenant) {
        const { password_hash, ...safe } = tenant;
        return safe;
    }
    async validateUniqueFields(dto) {
        const existing = await this.prisma.tenant.findFirst({
            where: {
                OR: [
                    {
                        code: dto.code,
                    },
                    {
                        slug: dto.slug,
                    },
                    ...(dto.domain
                        ? [
                            {
                                domain: dto.domain,
                            },
                        ]
                        : []),
                    ...(dto.email
                        ? [
                            {
                                email: dto.email,
                            },
                        ]
                        : []),
                ],
            },
        });
        if (!existing) {
            return;
        }
        if (existing.code === dto.code) {
            throw new common_1.ConflictException('Tenant code already exists.');
        }
        if (existing.slug === dto.slug) {
            throw new common_1.ConflictException('Tenant slug already exists.');
        }
        if (dto.domain &&
            existing.domain === dto.domain) {
            throw new common_1.ConflictException('Tenant domain already exists.');
        }
        if (dto.email &&
            existing.email === dto.email) {
            throw new common_1.ConflictException('Tenant email already exists.');
        }
    }
    async ensureTenantExists(id) {
        const tenant = await this.prisma.tenant.findFirst({
            where: {
                id,
                deleted_at: null,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' was not found.`);
        }
        return tenant;
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map
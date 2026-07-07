import { Tenant } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
export declare class OrganizationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(tenantId: string): Promise<Omit<Tenant, 'password_hash'>>;
    updateProfile(tenantId: string, dto: UpdateOrganizationProfileDto): Promise<Omit<Tenant, 'password_hash'>>;
}

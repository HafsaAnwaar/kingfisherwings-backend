import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { PortalAuthController } from './portal-auth.controller';
import { PortalAdminController } from './portal-admin.controller';
import { PortalAuthGuard } from './guards/portal-auth.guard';
import { PortalService } from './portal.service';

@Module({
  imports: [PrismaModule, EmailModule, JwtModule.register({})],
  controllers: [PortalAuthController, PortalAdminController],
  providers: [PortalService, PortalAuthGuard],
  exports: [PortalService, PortalAuthGuard],
})
export class PortalModule {}

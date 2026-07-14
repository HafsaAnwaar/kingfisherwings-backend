import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrganizationModule } from '../organization/organization.module';
import { ChartOfAccountsController } from './chart-of-accounts.controller';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [PrismaModule, OrganizationModule],
  controllers: [ChartOfAccountsController, VouchersController],
  providers: [ChartOfAccountsService, VouchersService],
  exports: [ChartOfAccountsService, VouchersService],
})
export class GlModule {}

import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { StorageModule } from "../../shared/storage/storage.module";

import { OrganizationController } from "./organization.controller";
import { OrganizationLogoController } from "./organization-logo.controller";
import { OrganizationSettingsController } from "./organization-settings.controller";
import { OrganizationService } from "./organization.service";

import { BankAccountsController } from "./bank-accounts/bank-accounts.controller";
import { BankAccountsService } from "./bank-accounts/bank-accounts.service";

import { NumberFormatsController } from "./number-formats/number-formats.controller";
import { NumberFormatsService } from "./number-formats/number-formats.service";
import { NumberGeneratorService } from "./number-formats/number-generator.service";

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    OrganizationController,
    OrganizationLogoController,
    OrganizationSettingsController,
    BankAccountsController,
    NumberFormatsController,
  ],
  providers: [
    OrganizationService,
    BankAccountsService,
    NumberFormatsService,
    NumberGeneratorService,
  ],
  exports: [NumberGeneratorService, OrganizationService, BankAccountsService],
})
export class OrganizationModule {}

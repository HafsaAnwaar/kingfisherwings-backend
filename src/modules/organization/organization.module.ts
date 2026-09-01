import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";

import { OrganizationController } from "./organization.controller";
import { OrganizationService } from "./organization.service";

import { BankAccountsController } from "./bank-accounts/bank-accounts.controller";
import { BankAccountsService } from "./bank-accounts/bank-accounts.service";

import { NumberFormatsController } from "./number-formats/number-formats.controller";
import { NumberFormatsService } from "./number-formats/number-formats.service";
import { NumberGeneratorService } from "./number-formats/number-generator.service";

@Module({
  imports: [PrismaModule],
  controllers: [
    OrganizationController,
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

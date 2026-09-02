import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { EmailModule } from "../../shared/email/email.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { CronSecretGuard } from "../../common/guards/cron-secret.guard";
import { QuotationsController } from "./quotations.controller";
import { QuotationsService } from "./quotations.service";
import { TariffsController } from "./tariffs/tariffs.controller";
import { TariffsService } from "./tariffs/tariffs.service";
import { ServiceCatalogController } from "./service-catalog/service-catalog.controller";
import { ServiceCatalogService } from "./service-catalog/service-catalog.service";
import { QuotationNegotiationService } from "./quotation-negotiation.service";
import { ZipDistancesController } from "./zip-distances/zip-distances.controller";
import { ZipDistancesService } from "./zip-distances/zip-distances.service";

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    EmailModule,
    StorageModule,
    NotificationsModule,
  ],
  // Tariffs + zip-distances MUST register before QuotationsController so
  // Nest does not let GET /quotations/:id swallow /quotations/tariffs.
  controllers: [
    ServiceCatalogController,
    TariffsController,
    ZipDistancesController,
    QuotationsController,
  ],
  providers: [
    QuotationsService,
    TariffsService,
    ServiceCatalogService,
    QuotationNegotiationService,
    ZipDistancesService,
    CronSecretGuard,
  ],
  exports: [
    QuotationsService,
    TariffsService,
    ServiceCatalogService,
    QuotationNegotiationService,
  ],
})
export class QuotationsModule {}

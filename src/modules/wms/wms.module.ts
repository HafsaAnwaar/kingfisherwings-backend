import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { InvoicesModule } from "../invoices/invoices.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { OrganizationModule } from "../organization/organization.module";
import { WmsAsnController } from "./wms-asn.controller";
import { WmsAsnService } from "./wms-asn.service";
import { WmsCronService } from "./wms-cron.service";
import { WmsCustomerNotifyService } from "./wms-customer-notify.service";
import { WmsGdoController } from "./wms-gdo.controller";
import { WmsGdoService } from "./wms-gdo.service";
import { WmsGrnController } from "./wms-grn.controller";
import { WmsGrnService } from "./wms-grn.service";
import { WmsItemsController } from "./wms-items.controller";
import { WmsItemsService } from "./wms-items.service";
import { WmsOpsBoardController } from "./wms-ops-board.controller";
import { WmsOpsBoardService } from "./wms-ops-board.service";
import { WmsSettingsController } from "./wms-settings.controller";
import { WmsSettingsService } from "./wms-settings.service";
import { WmsStockController } from "./wms-stock.controller";
import { WmsStockService } from "./wms-stock.service";
import { WmsStorageController } from "./wms-storage.controller";
import { WmsStorageService } from "./wms-storage.service";

@Module({
  imports: [
    ScheduleModule,
    PrismaModule,
    PdfModule,
    StorageModule,
    EmailModule,
    OrganizationModule,
    InvoicesModule,
    NotificationsModule,
  ],
  controllers: [
    WmsSettingsController,
    WmsItemsController,
    WmsAsnController,
    WmsGrnController,
    WmsGdoController,
    WmsStockController,
    WmsStorageController,
    WmsOpsBoardController,
  ],
  providers: [
    WmsSettingsService,
    WmsItemsService,
    WmsCustomerNotifyService,
    WmsGrnService,
    WmsAsnService,
    WmsGdoService,
    WmsStockService,
    WmsStorageService,
    WmsOpsBoardService,
    WmsCronService,
  ],
  exports: [WmsStockService, WmsStorageService],
})
export class WmsModule {}

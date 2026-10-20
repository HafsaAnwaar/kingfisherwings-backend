import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { JobsModule } from "../jobs/jobs.module";
import { PartiesModule } from "../parties/parties.module";
import { MastersModule } from "../masters/masters.module";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import { OpsActivityModule } from "../ops-activity/ops-activity.module";
import { TrackModule } from "../track/track.module";
import { ShipmentsController } from "./shipments.controller";
import { ShipmentOpsAttachmentsController } from "./shipment-ops-attachments.controller";
import { ShipmentsService } from "./shipments.service";
import { ShipmentDetailService } from "./shipment-detail.service";
import { ShipmentTabParityService } from "./shipment-tab-parity.service";
import { ShipmentEdiService } from "./shipment-edi.service";
import { ShipmentStatusCatalogService } from "./shipment-status-catalog.service";

/**
 * Avoid importing DocumentationModule here: it imports JobsModule, and JobsModule
 * already forwardRefs ShipmentsModule — that cycle left JobsModule undefined at
 * DocumentationModule imports[2] and crashed Nest bootstrap.
 * DocumentationEdiService needs Prisma + Storage + Pdf (+ global ConfigService).
 */
@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    StorageModule,
    PdfModule,
    PartiesModule,
    MastersModule,
    OpsActivityModule,
    TrackModule,
    forwardRef(() => JobsModule),
  ],
    controllers: [ShipmentOpsAttachmentsController, ShipmentsController],
  providers: [
    ShipmentsService,
    ShipmentDetailService,
    ShipmentTabParityService,
    ShipmentEdiService,
    DocumentationEdiService,
    ShipmentStatusCatalogService,
  ],
  exports: [
    ShipmentsService,
    ShipmentDetailService,
    ShipmentTabParityService,
    ShipmentEdiService,
    ShipmentStatusCatalogService,
  ],
})
export class ShipmentsModule {}

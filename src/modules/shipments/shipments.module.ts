import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { StorageModule } from "../../shared/storage/storage.module";
import { JobsModule } from "../jobs/jobs.module";
import { PartiesModule } from "../parties/parties.module";
import { MastersModule } from "../masters/masters.module";
import { DocumentationEdiService } from "../documentation/documentation-edi.service";
import { OpsActivityModule } from "../ops-activity/ops-activity.module";
import { ShipmentsController } from "./shipments.controller";
import { ShipmentsService } from "./shipments.service";
import { ShipmentDetailService } from "./shipment-detail.service";
import { ShipmentTabParityService } from "./shipment-tab-parity.service";
import { ShipmentEdiService } from "./shipment-edi.service";

/**
 * Avoid importing DocumentationModule here: it imports JobsModule, and JobsModule
 * already forwardRefs ShipmentsModule — that cycle left JobsModule undefined at
 * DocumentationModule imports[2] and crashed Nest bootstrap.
 * DocumentationEdiService only needs Prisma + Storage (+ global ConfigService).
 */
@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    StorageModule,
    PartiesModule,
    MastersModule,
    OpsActivityModule,
    forwardRef(() => JobsModule),
  ],
  controllers: [ShipmentsController],
  providers: [
    ShipmentsService,
    ShipmentDetailService,
    ShipmentTabParityService,
    ShipmentEdiService,
    DocumentationEdiService,
  ],
  exports: [
    ShipmentsService,
    ShipmentDetailService,
    ShipmentTabParityService,
    ShipmentEdiService,
  ],
})
export class ShipmentsModule {}

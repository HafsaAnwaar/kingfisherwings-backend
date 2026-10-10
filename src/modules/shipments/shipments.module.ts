import { Module, forwardRef } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { JobsModule } from "../jobs/jobs.module";
import { DocumentationModule } from "../documentation/documentation.module";
import { ShipmentsController } from "./shipments.controller";
import { ShipmentsService } from "./shipments.service";
import { ShipmentDetailService } from "./shipment-detail.service";

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    QueueModule,
    forwardRef(() => JobsModule),
    DocumentationModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentDetailService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}

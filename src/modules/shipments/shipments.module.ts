import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { OrganizationModule } from "../organization/organization.module";
import { QueueModule } from "../../shared/queue/queue.module";
import { ShipmentsController } from "./shipments.controller";
import { ShipmentsService } from "./shipments.service";

@Module({
  imports: [PrismaModule, OrganizationModule, QueueModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}

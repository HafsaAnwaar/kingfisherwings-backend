import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ReportsModule } from "../reports/reports.module";
import { OperationsController } from "./operations.controller";
import { OperationsImportDeliveryService } from "./operations-import-delivery.service";
import { OperationsDashboardService } from "./operations-dashboard.service";

@Module({
  imports: [PrismaModule, ReportsModule],
  controllers: [OperationsController],
  providers: [OperationsImportDeliveryService, OperationsDashboardService],
})
export class OperationsModule {}

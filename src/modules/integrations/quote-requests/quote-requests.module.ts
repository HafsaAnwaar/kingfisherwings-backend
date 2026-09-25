import { Module } from "@nestjs/common";
import { PrismaModule } from "../../../prisma/prisma.module";
import { CrmModule } from "../../crm/crm.module";
import { QuoteRequestsController } from "./quote-requests.controller";
import { QuoteRequestsService } from "./quote-requests.service";

@Module({
  imports: [PrismaModule, CrmModule],
  controllers: [QuoteRequestsController],
  providers: [QuoteRequestsService],
  exports: [QuoteRequestsService],
})
export class QuoteRequestsModule {}

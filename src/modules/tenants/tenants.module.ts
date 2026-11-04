import { Module } from "@nestjs/common";

import { PrismaModule } from "../../prisma/prisma.module";
import { MastersModule } from "../masters/masters.module";
import { StorageModule } from "../../shared/storage/storage.module";

import { TenantsController } from "./tenants.controller";
import { TenantsService } from "./tenants.service";

@Module({
  imports: [PrismaModule, MastersModule, StorageModule],

  controllers: [TenantsController],

  providers: [TenantsService],

  exports: [TenantsService],
})
export class TenantsModule {}

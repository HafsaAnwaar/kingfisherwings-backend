import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PartiesController } from './parties.controller';
import { PartiesService } from './parties.service';
import { PartyExtensionsService } from './party-extensions.service';

@Module({
  imports: [PrismaModule],
  controllers: [PartiesController],
  providers: [PartiesService, PartyExtensionsService],
  exports: [PartiesService, PartyExtensionsService],
})
export class PartiesModule {}

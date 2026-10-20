import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { TrackController } from "./track.controller";
import { TrackService } from "./track.service";
import { TrackTimelineService } from "./track-timeline.service";

@Module({
  imports: [PrismaModule],
  controllers: [TrackController],
  providers: [TrackService, TrackTimelineService],
  exports: [TrackService, TrackTimelineService],
})
export class TrackModule {}

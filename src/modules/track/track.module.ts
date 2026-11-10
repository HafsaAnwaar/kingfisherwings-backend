import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { PdfModule } from "../../shared/pdf/pdf.module";
import { TrackController } from "./track.controller";
import { TrackService } from "./track.service";
import { TrackTimelineService } from "./track-timeline.service";
import { LiveTransportTrackingService } from "./live-transport-tracking.service";

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [TrackController],
  providers: [TrackService, TrackTimelineService, LiveTransportTrackingService],
  exports: [TrackService, TrackTimelineService, LiveTransportTrackingService],
})
export class TrackModule {}

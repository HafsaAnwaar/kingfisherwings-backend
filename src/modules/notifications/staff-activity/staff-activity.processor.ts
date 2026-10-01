import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { STAFF_ACTIVITY_QUEUE } from "./staff-activity.rules";
import {
  StaffActivityJob,
  StaffActivityService,
} from "./staff-activity.service";

@Processor(STAFF_ACTIVITY_QUEUE)
export class StaffActivityProcessor {
  constructor(private readonly activity: StaffActivityService) {}

  @Process("send")
  async handle(job: Job<StaffActivityJob>) {
    await this.activity.deliver(job.data);
  }
}

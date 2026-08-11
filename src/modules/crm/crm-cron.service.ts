import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrmActivityService } from './crm-activity.service';
import { CrmEmailService } from './crm-email.service';

@Injectable()
export class CrmCronService {
  private readonly logger = new Logger(CrmCronService.name);
  private followUpRunning = false;
  private campaignRunning = false;

  constructor(
    private readonly activity: CrmActivityService,
    private readonly email: CrmEmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async handleDueFollowUps() {
    if (this.followUpRunning) return;
    this.followUpRunning = true;
    try {
      const notified = await this.activity.notifyDueFollowUps();
      if (notified > 0) this.logger.log(`FOLLOW_UP_DUE sent: ${notified}`);
    } catch (err) {
      this.logger.error(`Follow-up cron failed: ${String(err)}`);
    } finally {
      this.followUpRunning = false;
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScheduledCampaigns() {
    if (this.campaignRunning) return;
    this.campaignRunning = true;
    try {
      const sent = await this.email.processScheduledCampaigns();
      if (sent > 0) this.logger.log(`Scheduled campaigns dispatched: ${sent}`);
    } catch (err) {
      this.logger.error(`Campaign cron failed: ${String(err)}`);
    } finally {
      this.campaignRunning = false;
    }
  }
}

export const DOCUMENT_GENERATION_QUEUE = 'document-generation';
export const EMAIL_CAMPAIGN_QUEUE = 'email-campaign';

export interface DocumentGenerationJobPayload {
  taskId: string;
  tenantId: string;
  isOriginal?: boolean;
}

export interface EmailCampaignJobPayload {
  tenantId: string;
  campaignId: string;
  actorId?: string;
  offset?: number;
  batchSize?: number;
}

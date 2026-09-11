export const DOCUMENT_GENERATION_QUEUE = "document-generation";
export const EMAIL_CAMPAIGN_QUEUE = "email-campaign";
export const DOCUMENTATION_UPLOAD_QUEUE = "documentation-upload";
export const REPORT_GENERATION_QUEUE = "report-generation";

export interface DocumentationUploadJobPayload {
  tenantId: string;
  batchId: string;
}

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

export interface ReportGenerationJobPayload {
  jobId: string;
  tenantId: string;
}

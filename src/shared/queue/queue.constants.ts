export const DOCUMENT_GENERATION_QUEUE = 'document-generation';

export interface DocumentGenerationJobPayload {
  taskId: string;
  tenantId: string;
  isOriginal?: boolean;
}

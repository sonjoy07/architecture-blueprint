export const DOCUMENT_INGESTION_QUEUE = 'document-ingestion-queue';
export const DOCUMENT_INGESTION_DLQ = 'document-ingestion-dlq';

export interface DocumentIngestionJobData {
  jobId: string;
  documentId: string;
  tenantId: string;
  title: string;
  fileUrl: string;
  rawText?: string;
  fileBufferBase64?: string;
  metadata?: Record<string, any>;
  submittedBy?: string;
  createdAt: string;
}

export interface IngestionProgressEvent {
  jobId: string;
  documentId: string;
  tenantId: string;
  stage: 'QUEUED' | 'PARSING' | 'PII_SCRUBBING' | 'CHUNKING' | 'EMBEDDING' | 'INDEXING' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  message: string;
  timestamp: string;
  error?: string;
}

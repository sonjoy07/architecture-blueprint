export interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: 'ENTERPRISE_SOC2' | 'FINANCIAL_HIPAA' | 'STANDARD';
  complianceTags: string[];
}

export type ProcessingStep = 1 | 2 | 3 | 4;

export type IngestionStatus = 'UPLOADING' | 'PII_SANITIZING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';

export interface PiiAuditMetrics {
  phoneNumbers: number;
  nationalIds: number;
  emails: number;
  creditCards: number;
  totalCharactersRedacted: number;
}

export interface IngestedDocument {
  id: string;
  tenantId: string;
  title: string;
  fileType: 'PDF' | 'TXT' | 'DOCX';
  fileSize: string;
  status: 'Indexed' | 'Processing' | 'Failed';
  chunks: number;
  redactionStatus: 'Scrubbed' | 'Clean' | 'Pending';
  piiAudit?: PiiAuditMetrics;
  createdAt: string;
}

export interface CitationItem {
  id: string;
  documentTitle: string;
  page: number;
  chunkId: string | number;
  section?: string;
  rawText: string;
  similarityScore: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  code?: string;
  plan: string;
  complianceTags: string[];
}

export type ProcessingStep = 1 | 2 | 3 | 4;

export type IngestionStep = 'UPLOADED' | 'PII_SANITIZED' | 'EMBEDDED' | 'READY' | 'FAILED';

export type IngestionStatus = 'UPLOADING' | 'PII_SANITIZING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';

export interface PiiAuditMetrics {
  phoneNumbers: number;
  nationalIds: number;
  emails: number;
  creditCards: number;
  totalCharactersRedacted: number;
}

export interface DocumentItem {
  id: string;
  tenantId: string;
  title: string;
  fileUrl: string;
  fileSize: string;
  status: IngestionStep;
  piiScrubbed: boolean;
  chunksCount: number;
  createdAt: string;
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

export interface CitationChunk {
  documentId: string;
  title: string;
  page: number;
  chunkIndex: number;
  section: string;
  content: string;
  rrfScore?: number;
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

export interface GuardrailInfo {
  passed: boolean;
  lexicalGroundingScore: number;
  hallucinatedCitationsCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: CitationChunk[];
  guardrail?: GuardrailInfo;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isStreaming?: boolean;
}

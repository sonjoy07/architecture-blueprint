export interface Tenant {
  id: string;
  name: string;
  plan: 'ENTERPRISE_SOC2' | 'FINANCIAL_HIPAA' | 'GOV_CLOUD';
  complianceTags: string[];
}

export type IngestionStep = 'UPLOADED' | 'PII_SANITIZED' | 'EMBEDDED' | 'READY' | 'FAILED';

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

export interface CitationChunk {
  documentId: string;
  title: string;
  page: number;
  chunkIndex: number;
  section: string;
  content: string;
  rrfScore?: number;
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

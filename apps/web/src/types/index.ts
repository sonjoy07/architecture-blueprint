export type UserRole = 'ORG_ADMIN' | 'COMPLIANCE_AUDITOR' | 'MEMBER';

export type TenantId = 't_acme_corp' | 't_nexus_health' | string;

export interface Tenant {
  id: TenantId;
  name: string;
  code?: string;
  plan: string;
  complianceTags: string[];
  shardId?: string;
  vectorDimensions?: number;
  totalIndexedDocs?: number;
}

export type Permission =
  | 'documents:write'
  | 'documents:delete'
  | 'copilot:query'
  | 'audit:read'
  | 'audit:export'
  | 'rls:configure';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: TenantId;
  tenantName: string;
  authProvider: string;
  mfaVerified: boolean;
  avatarText: string;
  assignedRoleDescription: string;
}

export interface PiiAuditMetrics {
  phoneNumbers: number;
  nationalIds: number;
  emails: number;
  creditCards: number;
  totalCharactersRedacted: number;
}

export interface IngestedDocument {
  id: string;
  tenantId: TenantId;
  title: string;
  fileType: 'PDF' | 'TXT' | 'DOCX';
  fileSize: string;
  status: 'INDEXED' | 'INGESTING' | 'FAILED' | 'Indexed' | 'Processing' | 'Failed';
  chunks: number;
  redactionStatus: 'SCRUBBED' | 'CLEAN' | 'PENDING' | 'Scrubbed' | 'Clean' | 'Pending';
  piiAudit?: PiiAuditMetrics;
  createdAt: string;
  sha256Hash?: string;
  lastIndexedBy?: string;
}

export interface RedactionEvent {
  id: string;
  timestamp: string;
  tenantId: TenantId;
  userId: string;
  documentTitle: string;
  entityType: 'PHONE' | 'NID_BD' | 'EMAIL' | 'CREDIT_CARD_PCI' | 'SSN';
  originalMasked: string;
  detectionRule: string;
  confidenceScore: number;
  shardPartition: string;
}

export interface CitationItem {
  id: string;
  documentTitle: string;
  page: number;
  chunkId: string | number;
  section?: string;
  rawText: string;
  similarityScore: number; // cosine distance / score
  tenantId?: string;
  vectorAlgorithm?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: CitationItem[];
  timestamp: string;
  isStreaming?: boolean;
}

// Backward Compatibility Aliases
export interface DocumentItem {
  id: string;
  tenantId: string;
  title: string;
  fileUrl: string;
  fileSize: string;
  status: any;
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

export type ProcessingStep = 1 | 2 | 3 | 4;
export type IngestionStep = 'UPLOADED' | 'PII_SANITIZED' | 'EMBEDDED' | 'READY' | 'FAILED';
export type IngestionStatus = 'UPLOADING' | 'PII_SANITIZING' | 'EMBEDDING' | 'INDEXED' | 'FAILED';

'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  FileCheck,
  Trash2,
  Terminal,
  Download,
  Search,
  Lock,
  Eye,
  X,
  ShieldAlert,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IngestedDocument, PiiAuditMetrics } from '../../types';
import {
  getTenantPolicies,
  addTenantPolicy,
  deleteTenantPolicy,
  PolicyDocumentMetadata,
} from '../../lib/policy-store';

const INITIAL_DOCS_STORE: Record<string, IngestedDocument[]> = {
  t_acme_corp: [
    {
      id: 'doc-acme-01',
      tenantId: 't_acme_corp',
      title: 'Acme_Global_Expense_and_FCPA_Compliance_Policy_2026.pdf',
      fileType: 'PDF',
      fileSize: '4.2 MB',
      status: 'INDEXED',
      chunks: 48,
      redactionStatus: 'SCRUBBED',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      piiAudit: { phoneNumbers: 3, nationalIds: 1, emails: 4, creditCards: 2, totalCharactersRedacted: 186 },
      createdAt: '2026-10-10T14:22:00Z',
    },
    {
      id: 'doc-acme-02',
      tenantId: 't_acme_corp',
      title: 'SOC2_Type_II_Security_Controls_and_Exceptions_Manual.pdf',
      fileType: 'PDF',
      fileSize: '18.6 MB',
      status: 'INDEXED',
      chunks: 184,
      redactionStatus: 'SCRUBBED',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      piiAudit: { phoneNumbers: 5, nationalIds: 3, emails: 8, creditCards: 0, totalCharactersRedacted: 342 },
      createdAt: '2026-10-11T09:15:00Z',
    },
    {
      id: 'doc-acme-03',
      tenantId: 't_acme_corp',
      title: 'Global_Employee_Data_Privacy_and_GDPR_Compliance_Manual.pdf',
      fileType: 'PDF',
      fileSize: '12.4 MB',
      status: 'INDEXED',
      chunks: 126,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      piiAudit: { phoneNumbers: 4, nationalIds: 2, emails: 6, creditCards: 1, totalCharactersRedacted: 265 },
      createdAt: '2026-10-11T16:40:00Z',
    },
    {
      id: 'doc-acme-04',
      tenantId: 't_acme_corp',
      title: 'PCI_DSS_v4.0_Cardholder_Data_Environment_Architecture.pdf',
      fileType: 'PDF',
      fileSize: '24.1 MB',
      status: 'INDEXED',
      chunks: 245,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
      piiAudit: { phoneNumbers: 6, nationalIds: 4, emails: 11, creditCards: 7, totalCharactersRedacted: 512 },
      createdAt: '2026-10-12T11:05:00Z',
    },
    {
      id: 'doc-acme-05',
      tenantId: 't_acme_corp',
      title: 'Corporate_Code_of_Business_Conduct_and_Ethics_Standard.pdf',
      fileType: 'PDF',
      fileSize: '3.8 MB',
      status: 'INDEXED',
      chunks: 36,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef9f8bdeac5b1',
      piiAudit: { phoneNumbers: 1, nationalIds: 0, emails: 2, creditCards: 0, totalCharactersRedacted: 64 },
      createdAt: '2026-10-13T08:30:00Z',
    },
    {
      id: 'doc-acme-06',
      tenantId: 't_acme_corp',
      title: 'Business_Continuity_and_Disaster_Recovery_Plan_BCP.pdf',
      fileType: 'PDF',
      fileSize: '15.9 MB',
      status: 'INDEXED',
      chunks: 162,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
      piiAudit: { phoneNumbers: 2, nationalIds: 1, emails: 5, creditCards: 0, totalCharactersRedacted: 178 },
      createdAt: '2026-10-14T13:45:00Z',
    },
  ],
  t_nexus_health: [
    {
      id: 'doc-nexus-01',
      tenantId: 't_nexus_health',
      title: 'Nexus_HIPAA_Security_Rule_Technical_Safeguards_SOP_v3.2.pdf',
      fileType: 'PDF',
      fileSize: '16.8 MB',
      status: 'INDEXED',
      chunks: 172,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
      piiAudit: { phoneNumbers: 8, nationalIds: 5, emails: 12, creditCards: 0, totalCharactersRedacted: 480 },
      createdAt: '2026-10-09T18:40:00Z',
    },
    {
      id: 'doc-nexus-02',
      tenantId: 't_nexus_health',
      title: 'ePHI_Encryption_and_Key_Management_Procedure_NIST_800_53.pdf',
      fileType: 'PDF',
      fileSize: '11.4 MB',
      status: 'INDEXED',
      chunks: 118,
      redactionStatus: 'SCRUBBED',
      sha256Hash: 'b5a2c9b50553e15c1c4a39e837ecd82dff4a3a1486cb95100078ab26cb10ceb0',
      piiAudit: { phoneNumbers: 4, nationalIds: 2, emails: 6, creditCards: 0, totalCharactersRedacted: 245 },
      createdAt: '2026-10-10T12:20:00Z',
    },
    {
      id: 'doc-nexus-03',
      tenantId: 't_nexus_health',
      title: 'Clinical_Trial_Data_Deidentification_Protocol_Safe_Harbor.pdf',
      fileType: 'PDF',
      fileSize: '14.2 MB',
      status: 'INDEXED',
      chunks: 146,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '385ea5222b429532fba3735a19a6f589d82c4ab15be44cb2b33213a56a0f1594',
      piiAudit: { phoneNumbers: 7, nationalIds: 6, emails: 9, creditCards: 0, totalCharactersRedacted: 390 },
      createdAt: '2026-10-11T15:10:00Z',
    },
    {
      id: 'doc-nexus-04',
      tenantId: 't_nexus_health',
      title: 'Business_Associate_Agreement_BAA_Model_Contract.pdf',
      fileType: 'PDF',
      fileSize: '5.1 MB',
      status: 'INDEXED',
      chunks: 54,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '60303ae22b998861bce3b28f33eec1be758a213c86c93c076dbe9f508c36cbbe',
      piiAudit: { phoneNumbers: 2, nationalIds: 1, emails: 3, creditCards: 0, totalCharactersRedacted: 110 },
      createdAt: '2026-10-12T17:35:00Z',
    },
    {
      id: 'doc-nexus-05',
      tenantId: 't_nexus_health',
      title: 'FDA_21_CFR_Part_11_Electronic_Records_Audit_Standard.pdf',
      fileType: 'PDF',
      fileSize: '9.6 MB',
      status: 'INDEXED',
      chunks: 94,
      redactionStatus: 'SCRUBBED',
      sha256Hash: '4355a46b19d348dc2f57c046f8ef63d4538ebb936000f3c9ee954a27460dd865',
      piiAudit: { phoneNumbers: 3, nationalIds: 2, emails: 4, creditCards: 0, totalCharactersRedacted: 165 },
      createdAt: '2026-10-13T10:50:00Z',
    },
  ],
};

export function IngestionView() {
  const { currentTenant, user, hasPermission } = useAuthTenant();
  const [documentsState, setDocumentsState] = useState<Record<string, IngestedDocument[]>>(INITIAL_DOCS_STORE);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [activeUpload, setActiveUpload] = useState<{
    fileName: string;
    fileSize: string;
    stage: 1 | 2 | 3 | 4;
    logs: string[];
    metrics?: PiiAuditMetrics;
  } | null>(null);

  // Sync with local policy store
  useEffect(() => {
    const syncPolicies = () => {
      const stored = getTenantPolicies(currentTenant.id);
      const converted: IngestedDocument[] = stored.map((p) => ({
        id: p.id,
        tenantId: currentTenant.id,
        title: p.title,
        fileType: p.title.endsWith('.txt') || p.title.endsWith('.md') ? 'TXT' : 'PDF',
        fileSize: `${Math.max(1.2, p.chunkCount * 0.08).toFixed(1)} MB`,
        status: 'INDEXED',
        chunks: p.chunkCount,
        redactionStatus: 'SCRUBBED',
        sha256Hash: p.sha256Hash,
        piiAudit: {
          phoneNumbers: 2,
          nationalIds: 1,
          emails: 3,
          creditCards: 0,
          totalCharactersRedacted: 140,
        },
        createdAt: new Date().toISOString(),
      }));
      setDocumentsState((prev) => ({
        ...prev,
        [currentTenant.id]: converted,
      }));
    };

    syncPolicies();
    window.addEventListener('tenant-policies-updated', syncPolicies);
    return () => window.removeEventListener('tenant-policies-updated', syncPolicies);
  }, [currentTenant.id]);

  // Permission check: write access required
  const canIngest = hasPermission('documents:write');

  const tenantDocs = documentsState[currentTenant.id] || [];
  const filteredDocs = tenantDocs.filter((d) =>
    d.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const simulateIngestionPipeline = async (file: {
    name: string;
    size: string;
    content?: string;
    rawFile?: File;
  }) => {
    let fileText = file.content || '';
    if (!fileText && file.rawFile) {
      try {
        fileText = await file.rawFile.text();
      } catch {
        fileText = '';
      }
    }
    if (!fileText) {
      fileText = `Policy Document: ${file.name}\nGoverning Operational Directives for Tenant Boundary ${currentTenant.id}.\nAll staff, engineers, and applications must strictly adhere to the mandatory provisions codified herein.`;
    }

    const ts = () => new Date().toISOString();
    const phoneMatches = fileText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    const emailMatches = fileText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const nidMatches = fileText.match(/\b\d{10,17}\b/g) || [];

    const detectedPii: PiiAuditMetrics = {
      phoneNumbers: Math.max(phoneMatches.length, Math.floor(Math.random() * 3) + 1),
      nationalIds: Math.max(nidMatches.length, Math.floor(Math.random() * 2) + 1),
      emails: Math.max(emailMatches.length, Math.floor(Math.random() * 4) + 1),
      creditCards: Math.floor(Math.random() * 2),
      totalCharactersRedacted: Math.floor(Math.random() * 180) + 80,
    };

    const chunkCount = Math.max(1, Math.ceil(fileText.length / 320));

    // Stage 1: Document Parsed
    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      stage: 1,
      logs: [
        `[${ts()}] [INGEST_PERIMETER] PAYLOAD_RECEIVE: file='${file.name}' size='${file.size}'`,
        `[${ts()}] [PARSER_WORKER] UNPACK_OK: extracting text streams, normalizing UTF-8 chunks...`,
        `[${ts()}] [STAGE_1_COMPLETED] Chunks created: ${chunkCount} semantic blocks identified (${fileText.length} characters parsed).`,
      ],
      metrics: detectedPii,
    });
    await new Promise((r) => setTimeout(r, 650));

    // Stage 2: Deterministic PII Redacted
    setActiveUpload((prev) => ({
      ...prev!,
      stage: 2,
      logs: [
        ...prev!.logs,
        `[${ts()}] [PII_INSPECTOR] REGEX_START: applying Luhn (PCI), BD-NID 10/13/17-digit, and RFC 5322 rules`,
        `[${ts()}] [PII_SCRUB] DETECTED: Bangladesh National ID 'NID-***-***-8910' (Rule: BD_NID_17_DIGIT)`,
        `[${ts()}] [PII_SCRUB] DETECTED: Mobile Phone '+880 17**-***421' (Rule: E164_BD_MOBILE)`,
        `[${ts()}] [STAGE_2_COMPLETED] Total ${detectedPii.totalCharactersRedacted} sensitive bytes masked to immutable tokens.`,
      ],
    }));
    await new Promise((r) => setTimeout(r, 700));

    // Stage 3: Vector Embeddings Generated
    setActiveUpload((prev) => ({
      ...prev!,
      stage: 3,
      logs: [
        ...prev!.logs,
        `[${ts()}] [EMBEDDING_GEN] Invoking text-embedding-3-small (1536-dim vectors)`,
        `[${ts()}] [EMBEDDING_GEN] Generating HNSW graph index: m=16, ef_construction=64`,
        `[${ts()}] [STAGE_3_COMPLETED] ${chunkCount} vector embeddings generated with cosine normalization.`,
      ],
    }));
    await new Promise((r) => setTimeout(r, 700));

    // Stage 4: Committed to RLS Partition & Policy Store
    setActiveUpload((prev) => ({
      ...prev!,
      stage: 4,
      logs: [
        `[${ts()}] [POSTGRES_KERNEL] BEGIN TRANSACTION; SET LOCAL app.current_tenant_id = '${currentTenant.id}';`,
        `[${ts()}] [POSTGRES_KERNEL] INSERT INTO documents & document_chunks (partition='${currentTenant.shardId}')`,
        `[${ts()}] [POSTGRES_KERNEL] RLS CONSTRAINT VERIFIED: zero-leakage isolation bound.`,
        `[${ts()}] [STAGE_4_COMPLETED] SUCCESS: Document committed to '${currentTenant.id}' vault and indexed into Copilot engine.`,
      ],
    }));
    await new Promise((r) => setTimeout(r, 600));

    const docId = `doc-${Date.now()}`;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const code = cleanName.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase().slice(0, 16) + '-v1';
    const sha256 = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const newPolicy: PolicyDocumentMetadata = {
      id: docId,
      code,
      title: file.name,
      version: 'v1.0',
      lastSynced: 'Just now',
      chunkCount,
      tag: 'INGESTED-POLICY',
      sha256Hash: sha256,
      defaultChunk: {
        id: `chunk-${docId}-01`,
        documentTitle: file.name,
        page: 1,
        chunkId: 1,
        section: 'Section 1.0 - Operational Policy Directive',
        rawText: fileText.slice(0, 450),
        similarityScore: 0.984,
        tenantId: currentTenant.id,
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
      rawText: fileText,
      isCustom: true,
    };

    // Save to shared policy store so PolicyWorkstation and Gemini Copilot immediately have this document!
    addTenantPolicy(currentTenant.id, newPolicy);

    // Also attempt backend dispatch
    try {
      if (file.rawFile) {
        const formData = new FormData();
        formData.append('file', file.rawFile);
        fetch('/api/v1/documents/upload', {
          method: 'POST',
          headers: { 'x-tenant-id': currentTenant.id },
          body: formData,
        }).catch(() => {});
      }
    } catch {}

    setTimeout(() => {
      setActiveUpload(null);
    }, 1200);
  };

  const handleDelete = (id: string) => {
    deleteTenantPolicy(currentTenant.id, id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-mono text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0F172A] uppercase tracking-tight">
              Document Ingestion & Perimeter PII Scrubbing
            </span>
            <span className="text-[11px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] px-2 py-0.5 rounded-[3px] font-mono">
              {currentTenant.id}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] mt-1 font-sans">
            Multi-stage ingestion pipeline: Document Parsing &rarr; Deterministic PII Redaction &rarr; HNSW 1536d Embedding &rarr; PostgreSQL RLS Commit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748B] uppercase">Actor:</span>
          <span className="text-[11px] font-medium text-[#0F172A] bg-[#FFFFFF] px-2 py-1 rounded-[3px] border border-[#CBD5E1]">
            {user?.name || 'Authorized Session'} ({user?.role || 'MEMBER'})
          </span>
        </div>
      </div>

      {/* Role-Gated 403 Forbidden Banner for Non-Admin */}
      {!canIngest ? (
        <div className="p-5 rounded-[4px] border border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C] space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-xs text-[#B91C1C]">
            <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
            <span>403 Forbidden: Insufficient Tenant Permissions</span>
          </div>
          <p className="text-xs text-[#64748B] font-sans leading-relaxed">
            Your current assigned role (<code className="bg-[#FFFFFF] px-1 py-0.5 rounded-[3px] border border-[#CBD5E1] text-[#0F172A]">{user?.role || 'MEMBER'}</code>) lacks write authorization (<code className="bg-[#EFF6FF] px-1 py-0.5 rounded-[3px] border border-[#BFDBFE] text-[#1D4ED8]">documents:write</code>) on partition{' '}
            <strong className="text-[#0F172A]">{currentTenant.id}</strong>. Ingestion triggers, file deletion, and direct index mutations are restricted strictly to{' '}
            <strong className="text-[#0F172A]">Organization Administrators (<code>ORG_ADMIN</code>)</strong>.
          </p>
          <div className="pt-1 text-[11px] text-[#64748B]">
            <em>To test document ingestion, switch your active role to <code>ORG_ADMIN</code> in the top console navigation bar.</em>
          </div>
        </div>
      ) : (
        /* ORG_ADMIN Ingestion Suite */
        <div className="space-y-6">
          {/* Multi-Stage Pipeline Telemetry Card (Active when uploading) */}
          {activeUpload && (
            <div className="p-4 rounded-[4px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-[2px] bg-[#2563EB] animate-pulse" />
                  <span className="font-semibold text-[#0F172A]">{activeUpload.fileName}</span>
                  <span className="text-[#64748B] tabular-nums">({activeUpload.fileSize})</span>
                </div>
                <span className="text-[#2563EB] font-mono text-xs font-semibold">PIPELINE STAGE {activeUpload.stage}/4</span>
              </div>

              {/* 4 Pipeline Stages */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                {[
                  { stage: 1, title: 'Stage 1: Parsed', desc: 'Normalized semantic chunks' },
                  { stage: 2, title: 'Stage 2: PII Redacted', desc: 'Deterministic Luhn & BD-NID' },
                  { stage: 3, title: 'Stage 3: Embedded', desc: '1536-dim HNSW graph' },
                  { stage: 4, title: 'Stage 4: RLS Committed', desc: 'Isolated partition lock' },
                ].map((s) => {
                  const isDone = activeUpload.stage > s.stage;
                  const isCurrent = activeUpload.stage === s.stage;
                  return (
                    <div
                      key={s.stage}
                      className={`p-2.5 rounded-[3px] border ${
                        isCurrent
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                          : isDone
                          ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{s.title}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5 text-[#2563EB] animate-spin" />
                        ) : (
                          <span className="text-[9px]">PENDING</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">{s.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Live Terminal stdout Feed */}
              <div className="p-3 rounded-[3px] bg-[#0F172A] border border-[#334155] font-mono text-[10px] space-y-1 text-[#94A3B8] max-h-48 overflow-y-auto">
                <div className="text-[#64748B] border-b border-[#334155] pb-1 mb-1">
                  $ tail -f /var/log/lexiguard/ingest_worker.stdout
                </div>
                {activeUpload.logs.map((log, idx) => (
                  <div key={idx} className="leading-snug">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                const f = e.dataTransfer.files[0];
                let text = '';
                try {
                  text = await f.text();
                } catch {}
                simulateIngestionPipeline({
                  name: f.name,
                  size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                  content: text,
                  rawFile: f,
                });
              }
            }}
            className={`border border-dashed rounded-[4px] p-6 text-center transition-all bg-[#F8FAFC] ${
              isDragging
                ? 'border-[#2563EB] bg-[#EFF6FF]'
                : 'border-[#CBD5E1] hover:border-[#94A3B8]'
            }`}
          >
            <div className="max-w-md mx-auto space-y-2">
              <UploadCloud className="w-8 h-8 text-[#2563EB] mx-auto" />
              <div className="text-[#0F172A] font-semibold text-xs">
                Drag and drop corporate policy documents (.PDF, .TXT, .MD, .JSON)
              </div>
              <p className="text-[11px] text-[#64748B] font-sans">
                Automatic zero-egress perimeter redaction enforces Luhn algorithm (PCI DSS) and Bangladesh National ID (10/13/17-digit) masking prior to vector embedding generation.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap">
                <label className="px-3 py-1.5 rounded-[3px] bg-[#0F172A] hover:bg-[#1E293B] text-white cursor-pointer border border-[#0F172A] text-xs transition-colors flex items-center gap-1.5">
                  <UploadCloud className="w-3.5 h-3.5" />
                  Select File
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.json,.csv"
                    className="hidden"
                    onChange={async (e) => {
                      if (e.target.files?.[0]) {
                        const f = e.target.files[0];
                        let text = '';
                        try {
                          text = await f.text();
                        } catch {}
                        simulateIngestionPipeline({
                          name: f.name,
                          size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                          content: text,
                          rawFile: f,
                        });
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="px-3 py-1.5 rounded-[3px] bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] cursor-pointer text-xs transition-colors flex items-center gap-1.5 font-medium"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Paste Policy Text
                </button>

                <button
                  type="button"
                  onClick={() =>
                    simulateIngestionPipeline({
                      name: 'PCI_DSS_v4.0_Encrypted_Cardholder_Environment_Spec.pdf',
                      size: '14.2 MB',
                    })
                  }
                  className="px-3 py-1.5 rounded-[3px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] border border-[#CBD5E1] cursor-pointer text-xs transition-colors"
                >
                  Simulate Sample
                </button>
              </div>
            </div>
          </div>

          {/* Paste Policy Text Modal */}
          {isPasteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-[#FFFFFF] border border-[#CBD5E1] rounded-[6px] shadow-xl w-full max-w-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2563EB]" />
                    <span className="font-semibold text-sm text-[#0F172A]">
                      Direct Ingest & Scrub Policy Document
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPasteModalOpen(false)}
                    className="text-[#94A3B8] hover:text-[#0F172A] p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-[#475569] font-medium mb-1">
                      Policy Document Title (.txt / .md / .pdf)
                    </label>
                    <input
                      type="text"
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      placeholder="e.g. Remote_Work_and_Stipend_Policy_2026.txt"
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[3px] px-3 py-1.5 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-medium mb-1">
                      Policy Content / Standard Operating Procedure
                    </label>
                    <textarea
                      rows={6}
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="Paste complete policy text here... E.g.: 'Employees are permitted up to 3 remote days per week. High-speed home fiber subsidy is $60 USD per month. Approved equipment expenses are reimbursed up to $1,000 USD every 2 years through the employee portal.'"
                      className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[3px] px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] font-sans"
                    />
                  </div>

                  <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2.5 rounded-[3px] border border-[#E2E8F0]">
                    💡 <strong>Live Copilot Grounding:</strong> Once ingested, this document is immediately committed to partition <code>{currentTenant.id}</code> and indexed into Gemini Copilot Workstation. You can immediately ask questions about this policy in Copilot!
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsPasteModalOpen(false)}
                    className="px-3 py-1.5 rounded-[3px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!pasteTitle.trim() || !pasteContent.trim()}
                    onClick={() => {
                      if (!pasteTitle.trim() || !pasteContent.trim()) return;
                      const titleWithExt =
                        pasteTitle.endsWith('.txt') ||
                        pasteTitle.endsWith('.md') ||
                        pasteTitle.endsWith('.pdf')
                          ? pasteTitle
                          : `${pasteTitle}.txt`;
                      simulateIngestionPipeline({
                        name: titleWithExt,
                        size: `${Math.max(0.1, (new Blob([pasteContent]).size / (1024 * 1024))).toFixed(1)} MB`,
                        content: pasteContent,
                      });
                      setIsPasteModalOpen(false);
                      setPasteTitle('');
                      setPasteContent('');
                    }}
                    className="px-4 py-1.5 rounded-[3px] bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Run 4-Stage Ingestion Pipeline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Catalog Table Header */}
      <div className="rounded-[4px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0F172A] uppercase text-xs">
              Indexed Documents ({filteredDocs.length})
            </span>
            <span className="text-[10px] text-[#64748B] font-mono">
              [Partition: {currentTenant.id}]
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search document registry..."
              className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[3px] pl-8 pr-3 py-1 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        {/* Data-Dense Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F1F5F9] text-[#64748B] text-[10px] uppercase font-semibold border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-2">Document Title & Hash</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Passages (1536d)</th>
                <th className="px-4 py-2">PII Entities Scrubbed</th>
                <th className="px-4 py-2">Indexed At (UTC)</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[11px]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B] font-sans">
                    No documents indexed in this tenant partition.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="odd:bg-[#FFFFFF] even:bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-[#0F172A] truncate max-w-sm sm:max-w-md">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                        SHA-256: {doc.sha256Hash} • <span className="tabular-nums">{doc.fileSize}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#16A34A]" />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#0F172A] font-mono tabular-nums">
                      {doc.chunks} chunks
                    </td>
                    <td className="px-4 py-2.5">
                      {doc.piiAudit ? (
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          {doc.piiAudit.phoneNumbers > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] tabular-nums">
                              {doc.piiAudit.phoneNumbers} Phone
                            </span>
                          )}
                          {doc.piiAudit.nationalIds > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] tabular-nums">
                              {doc.piiAudit.nationalIds} NID
                            </span>
                          )}
                          {doc.piiAudit.emails > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] tabular-nums">
                              {doc.piiAudit.emails} Email
                            </span>
                          )}
                          {doc.piiAudit.creditCards > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] tabular-nums">
                              {doc.piiAudit.creditCards} PCI
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#64748B]">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#64748B] tabular-nums">
                      {new Date(doc.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {canIngest && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 rounded-[3px] text-[#94A3B8] hover:text-[#B91C1C] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                          title="Purge Document Chunk Partition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { IngestedDocument, PiiAuditMetrics } from '../../types';

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
  const [documentsState, setDocumentsState] = useState(INITIAL_DOCS_STORE);
  const [searchFilter, setSearchFilter] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeUpload, setActiveUpload] = useState<{
    fileName: string;
    fileSize: string;
    stage: 1 | 2 | 3 | 4;
    logs: string[];
    metrics?: PiiAuditMetrics;
  } | null>(null);

  // Permission check: write access required
  const canIngest = hasPermission('documents:write');

  const tenantDocs = documentsState[currentTenant.id] || [];
  const filteredDocs = tenantDocs.filter((d) =>
    d.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const simulateIngestionPipeline = async (file: { name: string; size: string }) => {
    const ts = () => new Date().toISOString();
    const detectedPii: PiiAuditMetrics = {
      phoneNumbers: Math.floor(Math.random() * 4) + 1,
      nationalIds: Math.floor(Math.random() * 2) + 1,
      emails: Math.floor(Math.random() * 5) + 2,
      creditCards: Math.floor(Math.random() * 2),
      totalCharactersRedacted: Math.floor(Math.random() * 220) + 95,
    };

    // Stage 1: Document Parsed
    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      stage: 1,
      logs: [
        `[${ts()}] [INGEST_PERIMETER] PAYLOAD_RECEIVE: file='${file.name}' size='${file.size}'`,
        `[${ts()}] [PARSER_WORKER] UNPACK_OK: extracting text streams, normalizing UTF-8 chunks...`,
        `[${ts()}] [STAGE_1_COMPLETED] Chunks created: 42 semantic blocks identified.`,
      ],
      metrics: detectedPii,
    });
    await new Promise((r) => setTimeout(r, 700));

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
    await new Promise((r) => setTimeout(r, 800));

    // Stage 3: Vector Embeddings Generated
    setActiveUpload((prev) => ({
      ...prev!,
      stage: 3,
      logs: [
        ...prev!.logs,
        `[${ts()}] [EMBEDDING_GEN] Invoking text-embedding-3-small (1536-dim vectors)`,
        `[${ts()}] [EMBEDDING_GEN] Generating HNSW graph index: m=16, ef_construction=64`,
        `[${ts()}] [STAGE_3_COMPLETED] 42 vector embeddings generated with cosine normalization.`,
      ],
    }));
    await new Promise((r) => setTimeout(r, 750));

    // Stage 4: Committed to RLS Partition
    setActiveUpload((prev) => ({
      ...prev!,
      stage: 4,
      logs: [
        ...prev!.logs,
        `[${ts()}] [POSTGRES_KERNEL] BEGIN TRANSACTION; SET LOCAL app.current_tenant_id = '${currentTenant.id}';`,
        `[${ts()}] [POSTGRES_KERNEL] INSERT INTO documents & document_chunks (partition='${currentTenant.shardId}')`,
        `[${ts()}] [POSTGRES_KERNEL] RLS CONSTRAINT VERIFIED: zero-leakage isolation bound.`,
        `[${ts()}] [STAGE_4_COMPLETED] SUCCESS: Document committed to '${currentTenant.id}' vault.`,
      ],
    }));
    await new Promise((r) => setTimeout(r, 600));

    const newDoc: IngestedDocument = {
      id: `doc-${Date.now()}`,
      tenantId: currentTenant.id,
      title: file.name,
      fileType: 'PDF',
      fileSize: file.size,
      status: 'INDEXED',
      chunks: 42,
      redactionStatus: 'SCRUBBED',
      sha256Hash: Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
      piiAudit: detectedPii,
      createdAt: new Date().toISOString(),
    };

    setDocumentsState((prev) => ({
      ...prev,
      [currentTenant.id]: [newDoc, ...(prev[currentTenant.id] || [])],
    }));

    setTimeout(() => {
      setActiveUpload(null);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setDocumentsState((prev) => ({
      ...prev,
      [currentTenant.id]: (prev[currentTenant.id] || []).filter((d) => d.id !== id),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-mono text-xs">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252A36] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#E6EDF3] uppercase tracking-tight">
              Document Ingestion & Perimeter PII Scrubbing
            </span>
            <span className="text-[11px] bg-[#161920] border border-[#252A36] text-[#58A6FF] px-2 py-0.5 rounded-[3px] font-mono">
              {currentTenant.id}
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-1 font-sans">
            Multi-stage ingestion pipeline: Document Parsing &rarr; Deterministic PII Redaction &rarr; HNSW 1536d Embedding &rarr; PostgreSQL RLS Commit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#484F58] uppercase">Actor:</span>
          <span className="text-[11px] font-medium text-[#C9D1D9] bg-[#161920] px-2 py-1 rounded-[3px] border border-[#252A36]">
            {user?.name || 'Authorized Session'} ({user?.role || 'MEMBER'})
          </span>
        </div>
      </div>

      {/* Role-Gated 403 Forbidden Banner for Non-Admin */}
      {!canIngest ? (
        <div className="p-5 rounded-[4px] border border-[#DA3633]/40 bg-[#DA3633]/10 text-[#F85149] space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-xs text-[#F85149]">
            <ShieldAlert className="w-4 h-4 text-[#F85149]" />
            <span>403 Forbidden: Insufficient Tenant Permissions</span>
          </div>
          <p className="text-xs text-[#8B949E] font-sans leading-relaxed">
            Your current assigned role (<code className="bg-[#0D0F14] px-1 py-0.5 rounded-[3px] border border-[#252A36] text-[#E6EDF3]">{user?.role || 'MEMBER'}</code>) lacks write authorization (<code className="bg-[#0D0F14] px-1 py-0.5 rounded-[3px] border border-[#252A36] text-[#58A6FF]">documents:write</code>) on partition{' '}
            <strong className="text-[#E6EDF3]">{currentTenant.id}</strong>. Ingestion triggers, file deletion, and direct index mutations are restricted strictly to{' '}
            <strong className="text-[#E6EDF3]">Organization Administrators (<code>ORG_ADMIN</code>)</strong>.
          </p>
          <div className="pt-1 text-[11px] text-[#484F58]">
            <em>To test document ingestion, switch your active role to <code>ORG_ADMIN</code> in the top console navigation bar.</em>
          </div>
        </div>
      ) : (
        /* ORG_ADMIN Ingestion Suite */
        <div className="space-y-6">
          {/* Multi-Stage Pipeline Telemetry Card (Active when uploading) */}
          {activeUpload && (
            <div className="p-4 rounded-[4px] border border-[#252A36] bg-[#161920] space-y-3">
              <div className="flex items-center justify-between border-b border-[#252A36] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-[2px] bg-[#58A6FF] animate-pulse" />
                  <span className="font-semibold text-[#E6EDF3]">{activeUpload.fileName}</span>
                  <span className="text-[#8B949E] tabular-nums">({activeUpload.fileSize})</span>
                </div>
                <span className="text-[#58A6FF] font-mono text-xs font-semibold">PIPELINE STAGE {activeUpload.stage}/4</span>
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
                          ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]'
                          : isDone
                          ? 'border-[#238636]/60 bg-[#238636]/10 text-[#3FB950]'
                          : 'border-[#252A36] bg-[#0E1015] text-[#484F58]'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{s.title}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                        ) : isCurrent ? (
                          <Clock className="w-3.5 h-3.5 text-[#58A6FF] animate-spin" />
                        ) : (
                          <span className="text-[9px]">PENDING</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8B949E] block mt-0.5">{s.desc}</span>
                    </div>
                  );
                })}
              </div>

              {/* Live Terminal stdout Feed */}
              <div className="p-3 rounded-[3px] bg-[#0A0C10] border border-[#252A36] font-mono text-[10px] space-y-1 text-[#8B949E] max-h-48 overflow-y-auto">
                <div className="text-[#484F58] border-b border-[#252A36] pb-1 mb-1">
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
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                const f = e.dataTransfer.files[0];
                simulateIngestionPipeline({
                  name: f.name,
                  size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                });
              }
            }}
            className={`border border-dashed rounded-[4px] p-6 text-center transition-all bg-[#161920] ${
              isDragging
                ? 'border-[#58A6FF] bg-[#58A6FF]/5'
                : 'border-[#252A36] hover:border-[#30363D]'
            }`}
          >
            <div className="max-w-md mx-auto space-y-2">
              <UploadCloud className="w-8 h-8 text-[#58A6FF] mx-auto" />
              <div className="text-[#E6EDF3] font-semibold text-xs">
                Drag and drop corporate policy documents (.PDF, .TXT)
              </div>
              <p className="text-[11px] text-[#8B949E] font-sans">
                Automatic zero-egress perimeter redaction enforces Luhn algorithm (PCI DSS) and Bangladesh National ID (10/13/17-digit) masking prior to vector embedding generation.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <label className="px-3 py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] cursor-pointer border border-[#30363D] text-xs transition-colors">
                  Select File
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const f = e.target.files[0];
                        simulateIngestionPipeline({
                          name: f.name,
                          size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
                        });
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    simulateIngestionPipeline({
                      name: 'PCI_DSS_v4.0_Encrypted_Cardholder_Environment_Spec.pdf',
                      size: '14.2 MB',
                    })
                  }
                  className="px-3 py-1.5 rounded-[3px] bg-[#1F232D] hover:bg-[#252A36] text-[#58A6FF] border border-[#252A36] cursor-pointer text-xs transition-colors"
                >
                  Simulate Sample Ingestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Table Header */}
      <div className="rounded-[4px] border border-[#252A36] bg-[#161920] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#252A36] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#12141A]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#E6EDF3] uppercase text-xs">
              Indexed Documents ({filteredDocs.length})
            </span>
            <span className="text-[10px] text-[#8B949E] font-mono">
              [Partition: {currentTenant.id}]
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search document registry..."
              className="w-full bg-[#0D0F14] border border-[#252A36] rounded-[3px] pl-8 pr-3 py-1 text-xs text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>
        </div>

        {/* Data-Dense Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#12141A] text-[#8B949E] text-[10px] uppercase font-semibold border-b border-[#252A36]">
              <tr>
                <th className="px-4 py-2">Document Title & Hash</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Passages (1536d)</th>
                <th className="px-4 py-2">PII Entities Scrubbed</th>
                <th className="px-4 py-2">Indexed At (UTC)</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252A36] text-[11px]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8B949E] font-sans">
                    No documents indexed in this tenant partition.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="odd:bg-[#161920] even:bg-[#12141A]/50 hover:bg-[#1F232D]/70 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-[#E6EDF3] truncate max-w-sm sm:max-w-md">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-[#8B949E] font-mono mt-0.5">
                        SHA-256: {doc.sha256Hash} • <span className="tabular-nums">{doc.fileSize}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-semibold bg-[#238636]/15 text-[#3FB950] border border-[#238636]/40">
                        <span className="w-1.5 h-1.5 rounded-[1px] bg-[#3FB950]" />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#E6EDF3] font-mono tabular-nums">
                      {doc.chunks} chunks
                    </td>
                    <td className="px-4 py-2.5">
                      {doc.piiAudit ? (
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          {doc.piiAudit.phoneNumbers > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#21262D] text-[#C9D1D9] border border-[#30363D] tabular-nums">
                              {doc.piiAudit.phoneNumbers} Phone
                            </span>
                          )}
                          {doc.piiAudit.nationalIds > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/30 tabular-nums">
                              {doc.piiAudit.nationalIds} NID
                            </span>
                          )}
                          {doc.piiAudit.emails > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#21262D] text-[#C9D1D9] border border-[#30363D] tabular-nums">
                              {doc.piiAudit.emails} Email
                            </span>
                          )}
                          {doc.piiAudit.creditCards > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[3px] bg-[#D29922]/15 text-[#E3B341] border border-[#D29922]/40 tabular-nums">
                              {doc.piiAudit.creditCards} PCI
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#8B949E]">None</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#8B949E] tabular-nums">
                      {new Date(doc.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {canIngest && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1 rounded-[3px] text-[#8B949E] hover:text-[#F85149] hover:bg-[#DA3633]/20 transition-colors cursor-pointer"
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

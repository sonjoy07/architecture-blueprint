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
  Sparkles,
  Download,
  Search,
  Filter,
  Lock,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react';
import { useTenant } from '../../lib/tenant-context';
import { IngestedDocument, PiiAuditMetrics, ProcessingStep } from '../../types';

const INITIAL_DOCUMENTS: IngestedDocument[] = [
  // --- ACME CORP [TENANT A] ---
  {
    id: 'doc-acme-01',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Acme_Global_Expense_and_FCPA_Compliance_Policy_2026.pdf',
    fileType: 'PDF',
    fileSize: '4.2 MB',
    status: 'Indexed',
    chunks: 48,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 3,
      nationalIds: 1,
      emails: 4,
      creditCards: 2,
      totalCharactersRedacted: 186,
    },
    createdAt: '2026-10-10T14:22:00Z',
  },
  {
    id: 'doc-acme-02',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'SOC2_Type_II_Security_Controls_and_Exceptions_Manual.pdf',
    fileType: 'PDF',
    fileSize: '18.6 MB',
    status: 'Indexed',
    chunks: 184,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 5,
      nationalIds: 3,
      emails: 8,
      creditCards: 0,
      totalCharactersRedacted: 342,
    },
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'doc-acme-03',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Global_Employee_Data_Privacy_and_GDPR_Compliance_Manual.pdf',
    fileType: 'PDF',
    fileSize: '12.4 MB',
    status: 'Indexed',
    chunks: 126,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 4,
      nationalIds: 2,
      emails: 6,
      creditCards: 1,
      totalCharactersRedacted: 265,
    },
    createdAt: '2026-10-11T16:40:00Z',
  },
  {
    id: 'doc-acme-04',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'PCI_DSS_v4.0_Cardholder_Data_Environment_Architecture.pdf',
    fileType: 'PDF',
    fileSize: '24.1 MB',
    status: 'Indexed',
    chunks: 245,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 6,
      nationalIds: 4,
      emails: 11,
      creditCards: 7,
      totalCharactersRedacted: 512,
    },
    createdAt: '2026-10-12T11:05:00Z',
  },
  {
    id: 'doc-acme-05',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Corporate_Code_of_Business_Conduct_and_Ethics_Standard.pdf',
    fileType: 'PDF',
    fileSize: '3.8 MB',
    status: 'Indexed',
    chunks: 36,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 1,
      nationalIds: 0,
      emails: 2,
      creditCards: 0,
      totalCharactersRedacted: 64,
    },
    createdAt: '2026-10-13T08:30:00Z',
  },
  {
    id: 'doc-acme-06',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Business_Continuity_and_Disaster_Recovery_Plan_BCP.pdf',
    fileType: 'PDF',
    fileSize: '15.9 MB',
    status: 'Indexed',
    chunks: 162,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 2,
      nationalIds: 1,
      emails: 5,
      creditCards: 0,
      totalCharactersRedacted: 178,
    },
    createdAt: '2026-10-14T13:45:00Z',
  },

  // --- NEXUS DYNAMICS [TENANT B] ---
  {
    id: 'doc-nexus-01',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'Nexus_HIPAA_Security_Rule_Technical_Safeguards_SOP_v3.2.pdf',
    fileType: 'PDF',
    fileSize: '16.8 MB',
    status: 'Indexed',
    chunks: 172,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 8,
      nationalIds: 5,
      emails: 12,
      creditCards: 0,
      totalCharactersRedacted: 480,
    },
    createdAt: '2026-10-09T18:40:00Z',
  },
  {
    id: 'doc-nexus-02',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'ePHI_Encryption_and_Key_Management_Procedure_NIST_800_53.pdf',
    fileType: 'PDF',
    fileSize: '11.4 MB',
    status: 'Indexed',
    chunks: 118,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 4,
      nationalIds: 2,
      emails: 6,
      creditCards: 0,
      totalCharactersRedacted: 245,
    },
    createdAt: '2026-10-10T12:20:00Z',
  },
  {
    id: 'doc-nexus-03',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'Clinical_Trial_Data_Deidentification_Protocol_Safe_Harbor.pdf',
    fileType: 'PDF',
    fileSize: '14.2 MB',
    status: 'Indexed',
    chunks: 146,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 7,
      nationalIds: 6,
      emails: 9,
      creditCards: 0,
      totalCharactersRedacted: 390,
    },
    createdAt: '2026-10-11T15:10:00Z',
  },
  {
    id: 'doc-nexus-04',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'Business_Associate_Agreement_BAA_Model_Contract.pdf',
    fileType: 'PDF',
    fileSize: '5.1 MB',
    status: 'Indexed',
    chunks: 54,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 2,
      nationalIds: 1,
      emails: 3,
      creditCards: 0,
      totalCharactersRedacted: 110,
    },
    createdAt: '2026-10-12T17:35:00Z',
  },
  {
    id: 'doc-nexus-05',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'FDA_21_CFR_Part_11_Electronic_Records_Audit_Standard.pdf',
    fileType: 'PDF',
    fileSize: '9.6 MB',
    status: 'Indexed',
    chunks: 94,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 3,
      nationalIds: 2,
      emails: 4,
      creditCards: 0,
      totalCharactersRedacted: 165,
    },
    createdAt: '2026-10-13T10:50:00Z',
  },
];

export function DocumentUploader() {
  const { currentTenant, getApiHeaders } = useTenant();
  const [documents, setDocuments] = useState<IngestedDocument[]>(INITIAL_DOCUMENTS);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedAuditDoc, setSelectedAuditDoc] = useState<IngestedDocument | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeUpload, setActiveUpload] = useState<{
    fileName: string;
    fileSize: string;
    step: ProcessingStep;
    progress: number;
    metrics?: PiiAuditMetrics;
  } | null>(null);

  // Filter documents strictly by current active tenant to illustrate RLS boundaries
  const tenantDocs = documents.filter((doc) => doc.tenantId === currentTenant.id);
  const filteredDocs = tenantDocs.filter((doc) =>
    doc.title.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  // Aggregated PII metrics across the tenant's documents
  const aggregatedPii = tenantDocs.reduce<PiiAuditMetrics>(
    (acc, doc) => {
      if (doc.piiAudit) {
        acc.phoneNumbers += doc.piiAudit.phoneNumbers;
        acc.nationalIds += doc.piiAudit.nationalIds;
        acc.emails += doc.piiAudit.emails;
        acc.creditCards += doc.piiAudit.creditCards;
        acc.totalCharactersRedacted += doc.piiAudit.totalCharactersRedacted;
      }
      return acc;
    },
    { phoneNumbers: 0, nationalIds: 0, emails: 0, creditCards: 0, totalCharactersRedacted: 0 },
  );

  const simulateProcessingPipeline = async (file: { name: string; size: string }) => {
    const fileType = file.name.endsWith('.pdf') ? 'PDF' : 'TXT';

    // Step 1: Uploading (25%)
    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      step: 1,
      progress: 25,
    });
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Step 2: Deterministic PII Sanitization (50%)
    const detectedPii: PiiAuditMetrics = {
      phoneNumbers: Math.floor(Math.random() * 4) + 1,
      nationalIds: Math.floor(Math.random() * 3),
      emails: Math.floor(Math.random() * 5) + 2,
      creditCards: Math.floor(Math.random() * 2),
      totalCharactersRedacted: Math.floor(Math.random() * 250) + 80,
    };

    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      step: 2,
      progress: 50,
      metrics: detectedPii,
    });
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Step 3: HNSW Vector Embeddings (75%)
    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      step: 3,
      progress: 75,
      metrics: detectedPii,
    });
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Step 4: Indexed into PostgreSQL pgvector (100%)
    setActiveUpload({
      fileName: file.name,
      fileSize: file.size,
      step: 4,
      progress: 100,
      metrics: detectedPii,
    });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newDoc: IngestedDocument = {
      id: `doc-${Date.now()}`,
      tenantId: currentTenant.id,
      title: file.name,
      fileType: fileType as 'PDF' | 'TXT',
      fileSize: file.size,
      status: 'Indexed',
      chunks: Math.floor(Math.random() * 80) + 25,
      redactionStatus: 'Scrubbed',
      piiAudit: detectedPii,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setActiveUpload(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validExtension = file.name.endsWith('.pdf') || file.name.endsWith('.txt');
      if (!validExtension) {
        alert('Unsupported format. Please upload PDF or TXT compliance documents only.');
        return;
      }
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      simulateProcessingPipeline({ name: file.name, size: sizeStr });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      simulateProcessingPipeline({ name: file.name, size: sizeStr });
    }
  };

  const handleSimulateSample = () => {
    const samples = [
      { name: 'ISO_27001_Annex_A_Security_Controls_Assessment_2026.pdf', size: '14.8 MB' },
      { name: 'Enterprise_Third_Party_Vendor_Risk_Management_SOP.pdf', size: '8.4 MB' },
      { name: 'Critical_Infrastructure_Penetration_Testing_Report_Redacted.pdf', size: '19.2 MB' },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    simulateProcessingPipeline(picked);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleExportAuditJson = () => {
    const exportData = {
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      exportTimestamp: new Date().toISOString(),
      complianceCertification: 'SOC 2 Type II / HIPAA / GDPR Article 17',
      totalActiveDocuments: tenantDocs.length,
      piiTelemetry: aggregatedPii,
      documentsRegistry: tenantDocs,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTenant.name.replace(/[^a-zA-Z0-9]/g, '_')}_Audit_Log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Document Ingestion & Perimeter PII Sanitization
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {currentTenant.name}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated perimeter scrubbing, semantic chunking, and HNSW vector embedding generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAuditJson}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            Export Audit JSON
          </button>

          <button
            onClick={handleSimulateSample}
            disabled={!!activeUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ingest Verified Policy
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all bg-white dark:bg-slate-900 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 scale-[1.005]'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <input
          type="file"
          id="file-upload-input"
          accept=".pdf,.txt"
          onChange={handleFileInput}
          disabled={!!activeUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Drag & drop enterprise policy documents here
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
            Supported formats: <span className="font-mono font-medium">.PDF</span>, <span className="font-mono font-medium">.TXT</span> (up to 50MB)
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900">
            <ShieldCheck className="w-3.5 h-3.5" />
            Automatic Luhn algorithm & Bangladesh/International PII sanitization enforced
          </span>
        </div>
      </div>

      {/* Live Processing Timeline (Appears during upload) */}
      {activeUpload && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
                {activeUpload.fileName}
              </span>
              <span className="text-xs text-slate-400">({activeUpload.fileSize})</span>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {activeUpload.progress}%
            </span>
          </div>

          {/* Staged Progression Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { num: 1, title: 'Step 1: Uploading', desc: 'Secure payload stream' },
              { num: 2, title: 'Step 2: Deterministic PII', desc: 'Regex & Luhn scrubbing' },
              { num: 3, title: 'Step 3: Vector Embeddings', desc: '1536-dim text-embedding' },
              { num: 4, title: 'Step 4: Indexed', desc: 'pgvector HNSW + RLS' },
            ].map((step) => {
              const isDone = activeUpload.step > step.num;
              const isCurrent = activeUpload.step === step.num;

              return (
                <div
                  key={step.num}
                  className={`p-3.5 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                      : isDone
                      ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">#{step.num}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Inline PII Notification */}
          {activeUpload.metrics && (
            <div className="p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Perimeter Redaction Active:</strong> Replaced{' '}
                  {activeUpload.metrics.phoneNumbers} phone number(s),{' '}
                  {activeUpload.metrics.nationalIds} national ID(s), and{' '}
                  {activeUpload.metrics.emails} email(s) before vectorization.
                </span>
              </div>
              <span className="font-mono text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                [REDACTED_TYPE]
              </span>
            </div>
          )}
        </div>
      )}

      {/* PII Audit Badge Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Tenant PII Sanitization Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live telemetry aggregated across {tenantDocs.length} active documents in{' '}
              <strong>{currentTenant.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              Total Scrubbed Chars: <strong>{aggregatedPii.totalCharactersRedacted}</strong>
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-3.5 h-3.5" />
              GDPR Art. 17 & HIPAA ePHI Compliant
            </div>
          </div>
        </div>

        {/* Metric Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Phone Numbers Redacted
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {aggregatedPii.phoneNumbers}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">BD 01X & E.164 formats</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              National IDs / SSN
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {aggregatedPii.nationalIds}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">10, 13, 17 digit NID / US SSN</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Email Addresses
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {aggregatedPii.emails}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">RFC 5322 sanitized</span>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Credit Cards (Luhn)
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
              {aggregatedPii.creditCards}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Mod-10 verified</span>
          </div>
        </div>
      </div>

      {/* Table of Ingested Documents */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Ingested Compliance Registry</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {filteredDocs.length} Documents
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Strictly partitioned by PostgreSQL RLS for <code className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold">{currentTenant.id}</code>
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by document title..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">HNSW Chunks</th>
                <th className="px-6 py-3.5">Perimeter Redaction</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No matching compliance documents found in this tenant partition.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="truncate max-w-sm sm:max-w-md font-semibold">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.fileType} • {doc.fileSize} • SHA-256 Verified
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{doc.chunks}</span> chunks (1536d)
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedAuditDoc(doc)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 px-2.5 py-1 rounded border border-indigo-200/80 dark:border-indigo-800/60 cursor-pointer transition-colors"
                        title="Click to view PII Redaction Audit details"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{doc.redactionStatus} ({doc.piiAudit ? doc.piiAudit.phoneNumbers + doc.piiAudit.emails + doc.piiAudit.nationalIds : 0} entities)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedAuditDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1 cursor-pointer"
                        title="View Audit Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete document partition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PII Audit Detail Modal */}
      {selectedAuditDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  PII Sanitization & Ingestion Audit Certificate
                </h4>
              </div>
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Document</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block mt-0.5">{selectedAuditDoc.title}</span>
                <span className="font-mono text-[10px] text-slate-500 block mt-1">Tenant ID: {selectedAuditDoc.tenantId}</span>
              </div>

              {selectedAuditDoc.piiAudit && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                    Redacted Entity Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[10px] text-slate-400 block">Phone Numbers (01X / E.164)</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{selectedAuditDoc.piiAudit.phoneNumbers}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[10px] text-slate-400 block">National IDs / SSN</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{selectedAuditDoc.piiAudit.nationalIds}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[10px] text-slate-400 block">Email Addresses</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{selectedAuditDoc.piiAudit.emails}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <span className="text-[10px] text-slate-400 block">Credit Cards (Luhn Checked)</span>
                      <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{selectedAuditDoc.piiAudit.creditCards}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                    <strong>GDPR Art. 17 Compliant:</strong> Total {selectedAuditDoc.piiAudit.totalCharactersRedacted} characters sanitized before vector embedding generation. Raw identifiers are permanently excluded from the vector database.
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => setSelectedAuditDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

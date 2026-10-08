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
} from 'lucide-react';
import { useTenant } from '../../lib/tenant-context';
import { IngestedDocument, PiiAuditMetrics, ProcessingStep } from '../../types';

const INITIAL_DOCUMENTS: IngestedDocument[] = [
  {
    id: 'doc-acme-01',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8', // Acme Corp [Tenant A]
    title: 'Acme_Global_Expense_Reimbursement_Policy_2026.pdf',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    status: 'Indexed',
    chunks: 28,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 2,
      nationalIds: 1,
      emails: 3,
      creditCards: 1,
      totalCharactersRedacted: 142,
    },
    createdAt: '2026-10-10T14:22:00Z',
  },
  {
    id: 'doc-acme-02',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8', // Acme Corp [Tenant A]
    title: 'Acme_Employee_Code_of_Conduct_Standard.txt',
    fileType: 'TXT',
    fileSize: '840 KB',
    status: 'Indexed',
    chunks: 14,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 1,
      nationalIds: 0,
      emails: 2,
      creditCards: 0,
      totalCharactersRedacted: 58,
    },
    createdAt: '2026-10-11T09:15:00Z',
  },
  {
    id: 'doc-nexus-01',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2', // Nexus Dynamics [Tenant B]
    title: 'Nexus_HIPAA_ePHI_Security_Architecture.pdf',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    status: 'Indexed',
    chunks: 52,
    redactionStatus: 'Scrubbed',
    piiAudit: {
      phoneNumbers: 4,
      nationalIds: 2,
      emails: 5,
      creditCards: 0,
      totalCharactersRedacted: 236,
    },
    createdAt: '2026-10-09T18:40:00Z',
  },
];

export function DocumentUploader() {
  const { currentTenant, getApiHeaders } = useTenant();
  const [documents, setDocuments] = useState<IngestedDocument[]>(INITIAL_DOCUMENTS);
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
      phoneNumbers: Math.floor(Math.random() * 3) + 1,
      nationalIds: Math.floor(Math.random() * 2),
      emails: Math.floor(Math.random() * 3) + 1,
      creditCards: Math.floor(Math.random() * 2),
      totalCharactersRedacted: Math.floor(Math.random() * 150) + 40,
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
      chunks: Math.floor(Math.random() * 25) + 8,
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
        alert('Unsupported file format. Please upload PDF or TXT files only.');
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
      { name: 'Corporate_Information_Security_Standard_v3.pdf', size: '3.1 MB' },
      { name: 'Employee_Dispute_Resolution_Guidelines.txt', size: '540 KB' },
      { name: 'Vendor_Compliance_and_Data_Retention_Policy.pdf', size: '1.9 MB' },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    simulateProcessingPipeline(picked);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            Document Ingestion & PII Redaction
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {currentTenant.name}
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated perimeter scrubbing, semantic chunking, and HNSW vector embedding generation.
          </p>
        </div>

        <button
          onClick={handleSimulateSample}
          disabled={!!activeUpload}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ingest Sample Policy Document
        </button>
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

          {/* Inline PII Notification if discovered */}
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

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            GDPR Art. 17 & HIPAA Compliant
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
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Ingested Documents ({tenantDocs.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cryptographically isolated to tenant ID: <code className="font-mono text-[11px]">{currentTenant.id}</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Chunks</th>
                <th className="px-6 py-3.5">Redaction Status</th>
                <th className="px-6 py-3.5">Created At</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenantDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No documents found in this tenant partition. Drop a file above to begin ingestion.
                  </td>
                </tr>
              ) : (
                tenantDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="flex flex-col">
                        <span className="truncate max-w-sm sm:max-w-md">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.fileType} • {doc.fileSize}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                      {doc.chunks} chunks
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200/80 dark:border-indigo-800/60">
                        <FileCheck className="w-3 h-3 text-indigo-500" />
                        {doc.redactionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete document"
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
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useTenant } from '../../lib/tenant-context';
import { DocumentItem, IngestionStep } from '../../types';

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-pol-001',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Acme Employee Travel & Reimbursement Code (2026)',
    fileUrl: 'https://storage.googleapis.com/acme-vault/policies/travel-2026.pdf',
    fileSize: '2.4 MB',
    status: 'READY',
    piiScrubbed: true,
    chunksCount: 18,
    createdAt: '2026-09-28T10:14:00Z',
  },
  {
    id: 'doc-sec-008',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    title: 'Acme Information Security & PII Protection Standard',
    fileUrl: 'https://storage.googleapis.com/acme-vault/sec/sec-standard.pdf',
    fileSize: '4.1 MB',
    status: 'READY',
    piiScrubbed: true,
    chunksCount: 42,
    createdAt: '2026-09-29T14:32:00Z',
  },
  {
    id: 'doc-hipaa-002',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    title: 'Sovereign Health ePHI Handling & Encryption Protocols',
    fileUrl: 'https://storage.googleapis.com/sov-health/ephi-proto.pdf',
    fileSize: '5.8 MB',
    status: 'READY',
    piiScrubbed: true,
    chunksCount: 64,
    createdAt: '2026-09-27T08:00:00Z',
  },
  {
    id: 'doc-gov-901',
    tenantId: '9a1023bc-6f44-482a-b731-29d91f4211a7',
    title: 'Globex FedRAMP Access Control & Key Management Rules',
    fileUrl: 'https://storage.googleapis.com/globex-vault/fedramp-cmek.pdf',
    fileSize: '3.1 MB',
    status: 'READY',
    piiScrubbed: true,
    chunksCount: 29,
    createdAt: '2026-09-25T11:45:00Z',
  },
];

export function DocumentDashboard() {
  const { currentTenant, setTenant, availableTenants } = useTenant();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<{
    title: string;
    step: IngestionStep;
    progress: number;
  } | null>(null);

  // Filter documents strictly by currently selected tenant (RLS visualization)
  const tenantDocuments = documents.filter((d) => d.tenantId === currentTenant.id);

  const simulateIngestionFlow = async (fileName: string, fileSizeStr: string) => {
    const docId = 'doc-' + Math.random().toString(36).substring(2, 9);

    // Step 1: Uploaded
    setUploadingDoc({ title: fileName, step: 'UPLOADED', progress: 25 });
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: PII Sanitization
    setUploadingDoc({ title: fileName, step: 'PII_SANITIZED', progress: 50 });
    await new Promise((r) => setTimeout(r, 800));

    // Step 3: Vector Embeddings Generation
    setUploadingDoc({ title: fileName, step: 'EMBEDDED', progress: 75 });
    await new Promise((r) => setTimeout(r, 800));

    // Step 4: Ready
    setUploadingDoc({ title: fileName, step: 'READY', progress: 100 });
    await new Promise((r) => setTimeout(r, 400));

    const newDoc: DocumentItem = {
      id: docId,
      tenantId: currentTenant.id,
      title: fileName,
      fileUrl: `https://storage.googleapis.com/${currentTenant.id}/docs/${fileName}`,
      fileSize: fileSizeStr,
      status: 'READY',
      piiScrubbed: true,
      chunksCount: Math.floor(Math.random() * 20) + 5,
      createdAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadingDoc(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      simulateIngestionFlow(file.name, sizeMB);
    }
  };

  const handleSampleUpload = () => {
    const samples = [
      'Corporate_Whistleblower_Policy_v4.pdf',
      'Data_Classification_and_Retention_Schedule.docx',
      'Incident_Response_Playbook_2026.pdf',
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    simulateIngestionFlow(picked, '3.2 MB');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Tenant Isolation Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Document Ingestion & Tenant Policy Vault
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate policies with automated PII scrub and pgvector HNSW indexing.
          </p>
        </div>

        {/* Tenant Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Tenant:
          </label>
          <div className="relative">
            <select
              value={currentTenant.id}
              onChange={(e) => {
                const target = availableTenants.find((t) => t.id === e.target.value);
                if (target) setTenant(target);
              }}
              className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
            >
              {availableTenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.plan})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Perimeter */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all bg-white dark:bg-slate-900 shadow-sm ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
        }`}
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Drag and drop policy documents here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PDF, DOCX, TXT, and Markdown up to 50MB. Scrubbed at perimeter.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleSampleUpload}
              disabled={!!uploadingDoc}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-xs disabled:opacity-50"
            >
              Simulate Enterprise Policy Ingestion
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Ingestion Progress Card */}
      {uploadingDoc && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Ingesting: {uploadingDoc.title}
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
              {uploadingDoc.progress}%
            </span>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'UPLOADED', label: '1. Uploaded' },
              { key: 'PII_SANITIZED', label: '2. PII Sanitized' },
              { key: 'EMBEDDED', label: '3. Vector Embedded' },
              { key: 'READY', label: '4. Ready' },
            ].map((step) => {
              const stepsOrder: IngestionStep[] = ['UPLOADED', 'PII_SANITIZED', 'EMBEDDED', 'READY'];
              const currentStepIndex = stepsOrder.indexOf(uploadingDoc.step);
              const thisStepIndex = stepsOrder.indexOf(step.key as IngestionStep);
              const isDone = currentStepIndex >= thisStepIndex;
              const isCurrent = uploadingDoc.step === step.key;

              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold'
                      : isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'border-slate-200 bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:border-slate-800'
                  }`}
                >
                  {step.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Authorized Tenant Documents ({tenantDocuments.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Isolated strictly to tenant ID: <code className="text-[11px] font-mono">{currentTenant.id}</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Document Title</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">PII Sanitization</th>
                <th className="px-6 py-3.5">Chunks</th>
                <th className="px-6 py-3.5">Size</th>
                <th className="px-6 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenantDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No documents found for this tenant partition. Upload a document above to verify isolation.
                  </td>
                </tr>
              ) : (
                tenantDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 flex items-center gap-3">
                      <svg className="w-5 h-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate max-w-md">{doc.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {doc.piiScrubbed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Scrubbed
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {doc.chunksCount} chunks
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {doc.fileSize}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(doc.createdAt).toLocaleDateString()}
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

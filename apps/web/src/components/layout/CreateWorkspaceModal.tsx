'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { useTenant } from '../../lib/tenant-context';
import { Tenant } from '../../types';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newTenant: Tenant) => void;
}

const COMPLIANCE_TIERS = [
  {
    id: 'ENTERPRISE_SOC2',
    name: 'SOC 2 Type II Enterprise',
    desc: 'Audited zero-egress controls with AES-256 Customer-Managed Keys (CMEK).',
    tags: ['SOC 2 Type II', 'Zero-Egress Vault', 'Dedicated Partition'],
  },
  {
    id: 'FINANCIAL_HIPAA',
    name: 'HIPAA & HITECH Healthcare',
    desc: 'Strict ePHI safeguards with 6-year immutable WORM audit retention.',
    tags: ['HIPAA & HITECH', 'ePHI Guarded', 'Dedicated Partition'],
  },
  {
    id: 'PCI_DSS_BANKING',
    name: 'PCI-DSS v4.0 Banking Grade',
    desc: 'Cardholder Data Environment (CDE) isolation with HSM-backed keys.',
    tags: ['PCI-DSS Level 1', 'Banking Grade', 'HSM Encrypted'],
  },
  {
    id: 'GDPR_GLOBAL',
    name: 'GDPR & ISO 27001 Privacy',
    desc: 'Automated Article 17 perimeter redaction with EU data sovereignty.',
    tags: ['GDPR Art. 17', 'ISO 27001', 'EU Data Sovereign'],
  },
];

export function CreateWorkspaceModal({ isOpen, onClose, onCreated }: CreateWorkspaceModalProps) {
  const { addTenant } = useTenant();

  const [orgName, setOrgName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(COMPLIANCE_TIERS[0].id);
  const [domainPrefix, setDomainPrefix] = useState('');
  const [autoSeedDocs, setAutoSeedDocs] = useState(true);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  if (!isOpen) return null;

  const currentPlanObj = COMPLIANCE_TIERS.find((p) => p.id === selectedPlan) || COMPLIANCE_TIERS[0];
  const generatedId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'c8f' + Math.random().toString(36).substring(2, 11) + '-00' + Math.floor(Math.random() * 90 + 10);

  const sqlCommand = `INSERT INTO tenants (id, name, plan)
VALUES ('${generatedId}', '${orgName.trim() || 'New Enterprise Corp'}', '${selectedPlan}')
ON CONFLICT (id) DO NOTHING;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCommand);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || isProvisioning) return;

    setIsProvisioning(true);

    // Simulate cryptographic key generation and partition assignment
    await new Promise((r) => setTimeout(r, 600));

    const newTenant = addTenant({
      id: generatedId,
      name: orgName.trim(),
      code: domainPrefix.trim() ? domainPrefix.trim().toUpperCase() : orgName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 12),
      plan: selectedPlan,
      complianceTags: currentPlanObj.tags,
    });

    if (autoSeedDocs) {
      try {
        const storedCustomDocs = localStorage.getItem('app.custom_documents');
        const customDocs = storedCustomDocs ? JSON.parse(storedCustomDocs) : [];
        const starterDocs = [
          {
            id: `doc-${Date.now()}-1`,
            tenantId: newTenant.id,
            title: `${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_Master_Information_Security_Standard_2026.pdf`,
            fileType: 'PDF',
            fileSize: '8.4 MB',
            status: 'Indexed',
            chunks: 74,
            redactionStatus: 'Scrubbed',
            piiAudit: {
              phoneNumbers: 4,
              nationalIds: 2,
              emails: 7,
              creditCards: 1,
              totalCharactersRedacted: 240,
            },
            createdAt: new Date().toISOString(),
          },
          {
            id: `doc-${Date.now()}-2`,
            tenantId: newTenant.id,
            title: `${orgName.replace(/[^a-zA-Z0-9]/g, '_')}_Regulatory_Compliance_and_Audit_Procedures.pdf`,
            fileType: 'PDF',
            fileSize: '12.1 MB',
            status: 'Indexed',
            chunks: 112,
            redactionStatus: 'Scrubbed',
            piiAudit: {
              phoneNumbers: 2,
              nationalIds: 1,
              emails: 4,
              creditCards: 0,
              totalCharactersRedacted: 115,
            },
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem('app.custom_documents', JSON.stringify([...customDocs, ...starterDocs]));
      } catch {
        // ignore
      }
    }

    setIsProvisioning(false);
    onCreated?.(newTenant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Provision Enterprise Workspace
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold">
                  Zero-Egress
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Create an isolated organizational partition with dedicated cryptographic boundaries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Workspace Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Organization / Workspace Name *</span>
              <span className="text-[10px] text-slate-400 font-normal">e.g., Apex Financial, Horizon BioTech</span>
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. FinTech Global Bank"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Compliance & Security Tier Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Compliance & Cryptographic Standard *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COMPLIANCE_TIERS.map((tier) => {
                const isSelected = selectedPlan === tier.id;
                return (
                  <button
                    type="button"
                    key={tier.id}
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {tier.name}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {tier.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shard & Isolation Preview Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Partition Shard ID (UUID)
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-semibold">{generatedId}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentPlanObj.tags.map((t) => (
                <span
                  key={t}
                  className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Checkbox: Seed Sample Policy Documents */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="autoSeedDocs"
                checked={autoSeedDocs}
                onChange={(e) => setAutoSeedDocs(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="autoSeedDocs" className="cursor-pointer">
                <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                  Seed Verified Compliance Policy Documents
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Pre-indexes 2 authentic security & governance policies for instant testing
                </span>
              </label>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>

          {/* Optional SQL Command Preview Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowSqlPreview(!showSqlPreview)}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showSqlPreview ? 'Hide Database SQL Command' : 'Show PostgreSQL DDL Insertion'}</span>
            </button>

            {showSqlPreview && (
              <div className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-200 text-[10px] font-mono relative border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PostgreSQL 16 Multi-Tenant RLS Insert:</span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-sans cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap">{sqlCommand}</pre>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProvisioning}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!orgName.trim() || isProvisioning}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isProvisioning ? 'Provisioning Vault...' : 'Provision Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

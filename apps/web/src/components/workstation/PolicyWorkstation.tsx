'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Lock,
  BookOpen,
  Send,
  Copy,
  Check,
  Download,
  FileText,
  Activity,
  Cpu,
  Network,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { CitationItem } from '../../types';

interface PolicyDocumentMetadata {
  id: string;
  code: string;
  title: string;
  version: string;
  lastSynced: string;
  chunkCount: number;
  tag: string;
  sha256Hash: string;
  defaultChunk: CitationItem;
}

const TENANT_POLICIES: Record<string, PolicyDocumentMetadata[]> = {
  t_acme_corp: [
    {
      id: 'doc-sec-01',
      code: 'SEC-ISO27001-rev4',
      title: 'SOC 2 & ISO 27001 Security Controls Manual',
      version: 'v4.2',
      lastSynced: '2h ago',
      chunkCount: 184,
      tag: 'SOC2-TYPE-II',
      sha256Hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      defaultChunk: {
        id: 'chunk-sec-104',
        documentTitle: 'SOC 2 & ISO 27001 Security Controls Manual (v4.2)',
        page: 14,
        chunkId: 38,
        section: 'Section 4.3 - Production Access Control & Mandatory MFA',
        rawText:
          'All production systems, Cloud SQL databases, and Kubernetes clusters require hardware-backed WebAuthn/FIDO2 MFA authentication. Direct SSH access is strictly disabled; engineer access must transit through the Zero-Trust Identity-Aware Proxy (IAP) with ephemeral 4-hour role assignments approved via PagerDuty.',
        similarityScore: 0.9614,
        tenantId: 't_acme_corp',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-exp-02',
      code: 'HR-POL-2026-v2',
      title: 'Global Travel, Meal Per Diem & Expense Policy',
      version: 'v2.1',
      lastSynced: '4h ago',
      chunkCount: 48,
      tag: 'CORP-EXPENSE',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      defaultChunk: {
        id: 'chunk-exp-019',
        documentTitle: 'Global Travel, Meal Per Diem & Expense Policy (v2.1)',
        page: 6,
        chunkId: 19,
        section: 'Section 2.1 - Daily Meal Per Diem & Lodging Rates',
        rawText:
          'Employee meal expenses during business travel are capped at $75.00 USD/day for standard metros and $100.00 USD/day for Tier-1 international cities. Original digitized VAT receipts must be uploaded within 30 calendar days via the finance portal. Alcohol is non-reimbursable without VP pre-authorization.',
        similarityScore: 0.9782,
        tenantId: 't_acme_corp',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-gdpr-03',
      code: 'GDPR-PRIV-rev3',
      title: 'Global Employee Data Privacy & GDPR Standards',
      version: 'v3.0',
      lastSynced: '1d ago',
      chunkCount: 126,
      tag: 'GDPR-ART17',
      sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      defaultChunk: {
        id: 'chunk-gdpr-059',
        documentTitle: 'Global Employee Data Privacy & GDPR Standards (v3.0)',
        page: 22,
        chunkId: 59,
        section: 'Section 6.1 - Zero-Egress Ingress Filters & Tokenization',
        rawText:
          'Customer identity data entering tenant boundary t_acme_corp must pass deterministic PII tokenization filters before embedding generation. Unscrubbed PII must not be written to vector storage under any operational conditions.',
        similarityScore: 0.9421,
        tenantId: 't_acme_corp',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-pci-04',
      code: 'FIN-PCI-DSS-v4',
      title: 'PCI DSS v4.0 Cardholder Environment Architecture',
      version: 'v4.0',
      lastSynced: '2d ago',
      chunkCount: 245,
      tag: 'PCI-DSS-L1',
      sha256Hash: '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca7',
      defaultChunk: {
        id: 'chunk-pci-088',
        documentTitle: 'PCI DSS v4.0 Cardholder Environment Architecture',
        page: 31,
        chunkId: 88,
        section: 'Section 3.4 - Primary Account Number (PAN) Encryption',
        rawText:
          'PANs must be rendered unreadable anywhere they are stored using strong cryptography with associated key-management processes. Zero unmasked PAN digits may ever appear in log aggregates or vector metadata stores.',
        similarityScore: 0.9532,
        tenantId: 't_acme_corp',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-fcpa-05',
      code: 'FCPA-GOV-2026',
      title: 'Corporate Code of Business Conduct & Anti-Bribery Code',
      version: 'v1.8',
      lastSynced: '3d ago',
      chunkCount: 36,
      tag: 'FCPA-ETHICS',
      sha256Hash: '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef9f8bdeac5b1',
      defaultChunk: {
        id: 'chunk-fcpa-024',
        documentTitle: 'Corporate Code of Business Conduct & Anti-Bribery Code',
        page: 9,
        chunkId: 24,
        section: 'Section 3.4 - FCPA & Anti-Bribery Gift Restrictions',
        rawText:
          'Gifts, entertainment, or gratuities extended to foreign government officials or commercial partners exceeding $50.00 USD must be logged in the Global Ethics Ledger and pre-cleared by Legal. Strict liability applies under Foreign Corrupt Practices Act provisions.',
        similarityScore: 0.9511,
        tenantId: 't_acme_corp',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
  ],
  t_nexus_health: [
    {
      id: 'doc-hipaa-01',
      code: 'HIPAA-SEC-2026',
      title: 'HIPAA Security Rule & Technical Safeguards SOP',
      version: 'v5.1',
      lastSynced: '1h ago',
      chunkCount: 142,
      tag: 'HIPAA-ePHI',
      sha256Hash: 'b4c91028fa88c140411a7620bc1291882103ac1029471920ac3419918230aa92',
      defaultChunk: {
        id: 'chunk-hipaa-031',
        documentTitle: 'HIPAA Security Rule & Technical Safeguards SOP (v5.1)',
        page: 12,
        chunkId: 31,
        section: 'Section 2.4 - Electronic Protected Health Information (ePHI) Access Controls',
        rawText:
          "Role-Based Access Control (RBAC) combined with Attribute-Based Access Control (ABAC) restricts electronic PHI queries exclusively to credentialed healthcare practitioners with active clinical assignments. Emergency 'break-glass' overrides generate real-time alerts to the compliance audit queue.",
        similarityScore: 0.9812,
        tenantId: 't_nexus_health',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-hitech-02',
      code: 'HITECH-RET-v3',
      title: 'Patient Privacy & 7-Year Statutory Retention Manual',
      version: 'v3.4',
      lastSynced: '6h ago',
      chunkCount: 89,
      tag: 'HITECH-WORM',
      sha256Hash: 'd9817e04ac10293411a7620bc1291882103ac1029471920ac3419918230bb71',
      defaultChunk: {
        id: 'chunk-hitech-028',
        documentTitle: 'Patient Privacy & 7-Year Statutory Retention Manual',
        page: 9,
        chunkId: 28,
        section: 'Section 3.1 - Statutory Retention & Cryptographic Disposal',
        rawText:
          'Under HITECH Omnibus provisions, clinical trial documentation and patient disclosure ledgers must be retained for 7 years post-discharge. Decommissioning requires crypto-shredding of AES-256 partition keys verified by independent cryptographic auditor attestation.',
        similarityScore: 0.9654,
        tenantId: 't_nexus_health',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
    {
      id: 'doc-baa-03',
      code: 'BAA-CLOUD-v2',
      title: 'Business Associate Agreement & Cloud Processing Directive',
      version: 'v2.0',
      lastSynced: '1d ago',
      chunkCount: 54,
      tag: 'BAA-VENDOR',
      sha256Hash: '12ca778b40aa9128c771a620bc1291882103ac1029471920ac3419918230cc55',
      defaultChunk: {
        id: 'chunk-baa-014',
        documentTitle: 'Business Associate Agreement & Cloud Processing Directive',
        page: 5,
        chunkId: 14,
        section: 'Section 1.3 - Third-Party Subprocessor Audits & Safe Harbors',
        rawText:
          'All third-party cloud hosting vendors and API providers handling patient records must execute a certified HIPAA Business Associate Agreement (BAA) with mandatory SOC 2 Type II attestation renewed every 12 months.',
        similarityScore: 0.949,
        tenantId: 't_nexus_health',
        vectorAlgorithm: 'pgvector HNSW (cosine)',
      },
    },
  ],
};

interface InvestigationRecord {
  id: string;
  timestamp: string;
  query: string;
  scopedPolicyCode?: string;
  synthesis: string;
  citations: CitationItem[];
  telemetry: {
    latencyMs: number;
    ttftMs: number;
    faithfulnessScore: number;
    vectorsScanned: number;
    waterfall?: {
      tokenizeMs: number;
      piiScrubMs: number;
      vectorHnswMs: number;
      crossEncoderMs: number;
      modelTtftMs: number;
    };
  };
  isStreaming?: boolean;
}

export function PolicyWorkstation() {
  const { currentTenant, user } = useAuthTenant();

  const activePolicies = useMemo(() => {
    return TENANT_POLICIES[currentTenant.id] || TENANT_POLICIES['t_acme_corp'];
  }, [currentTenant.id]);

  const [policySearch, setPolicySearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDocumentMetadata | null>(null);
  const [pinnedCitation, setPinnedCitation] = useState<CitationItem>(activePolicies[0].defaultChunk);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedWaterfallId, setExpandedWaterfallId] = useState<string | null>('inv-init-01');
  const [inspectorTab, setInspectorTab] = useState<'PASSAGE' | 'PDF_VIEW' | 'GRAPH'>('PASSAGE');

  const [investigations, setInvestigations] = useState<InvestigationRecord[]>([
    {
      id: 'inv-init-01',
      timestamp: '14:10:00 UTC',
      query:
        currentTenant.id === 't_acme_corp'
          ? 'What are our mandatory production access and WebAuthn MFA requirements?'
          : 'What are our mandatory ePHI access controls and emergency break-glass procedures?',
      scopedPolicyCode:
        currentTenant.id === 't_acme_corp' ? 'SEC-ISO27001-rev4' : 'HIPAA-SEC-2026',
      synthesis:
        currentTenant.id === 't_acme_corp'
          ? `Pursuant to Acme Corporation Information Security Controls [REF-SEC-01], all production databases, Kubernetes clusters, and Cloud SQL instances mandate hardware-backed WebAuthn / FIDO2 multi-factor authentication.\n\nDirect SSH or bastion access is permanently disabled; engineering transit requires Zero-Trust IAP approval with 4-hour ephemeral authorization tokens [REF-SEC-01]. Ingestion filters enforce deterministic PII tokenization before vector embedding persistence.`
          : `Under Nexus Dynamics Clinical Safeguards SOP [REF-HIPAA-01], electronic Protected Health Information (ePHI) queries are governed by role-based (RBAC) and attribute-based (ABAC) boundary policies.\n\nEmergency break-glass overrides require dual-clinician confirmation and dispatch automated alerts to the compliance audit queue within 60 seconds [REF-HIPAA-01]. All events are mirrored to immutable 6-year retention storage.`,
      citations: [activePolicies[0].defaultChunk],
      telemetry: {
        latencyMs: 382,
        ttftMs: 94,
        faithfulnessScore: 99.4,
        vectorsScanned: activePolicies[0].chunkCount,
        waterfall: {
          tokenizeMs: 14,
          piiScrubMs: 18,
          vectorHnswMs: 46,
          crossEncoderMs: 32,
          modelTtftMs: 272,
        },
      },
    },
  ]);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const terminalFeedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedPolicy(null);
    setPinnedCitation(activePolicies[0].defaultChunk);
  }, [activePolicies]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        queryInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPolicies = useMemo(() => {
    if (!policySearch.trim()) return activePolicies;
    const term = policySearch.toLowerCase();
    return activePolicies.filter(
      (p) =>
        p.code.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term) ||
        p.tag.toLowerCase().includes(term)
    );
  }, [activePolicies, policySearch]);

  const handleExecuteQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isExecuting) return;

    setIsExecuting(true);
    setInputQuery('');

    const isAcme = currentTenant.id === 't_acme_corp';
    const qLower = trimmed.toLowerCase();

    let matchedPolicy = selectedPolicy || activePolicies[0];
    if (!selectedPolicy) {
      if (isAcme) {
        if (qLower.includes('travel') || qLower.includes('expense') || qLower.includes('per diem')) {
          matchedPolicy = activePolicies.find((p) => p.code.includes('HR')) || activePolicies[1];
        } else if (qLower.includes('fcpa') || qLower.includes('gift') || qLower.includes('bribe')) {
          matchedPolicy = activePolicies.find((p) => p.code.includes('FCPA')) || activePolicies[4];
        } else if (qLower.includes('pci') || qLower.includes('card') || qLower.includes('pan')) {
          matchedPolicy = activePolicies.find((p) => p.code.includes('PCI')) || activePolicies[3];
        } else {
          matchedPolicy = activePolicies[0];
        }
      } else {
        if (qLower.includes('retention') || qLower.includes('year') || qLower.includes('disposal')) {
          matchedPolicy = activePolicies.find((p) => p.code.includes('HITECH')) || activePolicies[1];
        } else if (qLower.includes('baa') || qLower.includes('vendor') || qLower.includes('cloud')) {
          matchedPolicy = activePolicies.find((p) => p.code.includes('BAA')) || activePolicies[2];
        } else {
          matchedPolicy = activePolicies[0];
        }
      }
    }

    const citation = matchedPolicy.defaultChunk;
    const citationToken = `[REF-${matchedPolicy.code.split('-')[0]}-01]`;

    let generatedText = '';
    if (isAcme) {
      if (matchedPolicy.code.includes('HR')) {
        generatedText = `Under Acme Global Travel & Expense Policy (${matchedPolicy.version}) ${citationToken}, employee business meals are capped at $75.00/day ($100.00/day in Tier-1 metros). Itemized digitized receipts must be uploaded within 30 calendar days via the finance portal. Alcohol is non-reimbursable without VP sign-off ${citationToken}.`;
      } else if (matchedPolicy.code.includes('FCPA')) {
        generatedText = `Pursuant to Acme Anti-Bribery Directives ${citationToken}, any gift, gratuity, or hospitality extended to foreign commercial or government partners exceeding $50.00 USD must be logged in the Global Ethics Ledger and pre-cleared by Corporate Legal ${citationToken}.`;
      } else {
        generatedText = `According to ${matchedPolicy.title} (${matchedPolicy.version}) ${citationToken}, production infrastructure access mandates hardware-backed WebAuthn / FIDO2 MFA credentials. Bastion SSH is restricted, and engineering sessions operate under 4-hour ephemeral IAP role leases ${citationToken}.`;
      }
    } else {
      if (matchedPolicy.code.includes('HITECH')) {
        generatedText = `Under Nexus Dynamics Patient Privacy & Retention SOP ${citationToken}, clinical trial documentation, patient ledgers, and consent disclosures must be preserved for 7 continuous years post-discharge. Cryptographic key-shredding is required for decommissioned media ${citationToken}.`;
      } else {
        generatedText = `Pursuant to Nexus Dynamics Clinical Safeguards (${matchedPolicy.version}) ${citationToken}, electronic PHI retrieval is restricted to authorized clinicians with current clinical assignments. Emergency break-glass actions trigger real-time compliance ledger events ${citationToken}.`;
      }
    }

    const invId = `inv-${Date.now().toString(36)}`;
    const newRecord: InvestigationRecord = {
      id: invId,
      timestamp: new Date().toTimeString().split(' ')[0] + ' UTC',
      query: trimmed,
      scopedPolicyCode: matchedPolicy.code,
      synthesis: '',
      citations: [citation],
      telemetry: {
        latencyMs: 340 + Math.floor(Math.random() * 80),
        ttftMs: 95 + Math.floor(Math.random() * 25),
        faithfulnessScore: 99.4,
        vectorsScanned: matchedPolicy.chunkCount,
        waterfall: {
          tokenizeMs: 12 + Math.floor(Math.random() * 4),
          piiScrubMs: 16 + Math.floor(Math.random() * 6),
          vectorHnswMs: 38 + Math.floor(Math.random() * 12),
          crossEncoderMs: 26 + Math.floor(Math.random() * 8),
          modelTtftMs: 230 + Math.floor(Math.random() * 40),
        },
      },
      isStreaming: true,
    };

    setInvestigations((prev) => [...prev, newRecord]);
    setPinnedCitation(citation);

    const chunks = generatedText.split(' ');
    let currentText = '';
    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, 35));
      currentText += (i === 0 ? '' : ' ') + chunks[i];
      setInvestigations((prev) =>
        prev.map((r) => (r.id === invId ? { ...r, synthesis: currentText } : r))
      );
    }

    setInvestigations((prev) =>
      prev.map((r) => (r.id === invId ? { ...r, isStreaming: false } : r))
    );
    setIsExecuting(false);
  };

  const copyChunk = () => {
    navigator.clipboard.writeText(pinnedCitation.rawText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const downloadCertificate = () => {
    const cert = {
      verificationId: `CERT-HMAC-${Date.now()}`,
      tenantId: currentTenant.id,
      timestamp: new Date().toISOString(),
      document: pinnedCitation.documentTitle,
      page: pinnedCitation.page,
      chunkId: pinnedCitation.chunkId,
      similarityScore: pinnedCitation.similarityScore,
      cosineDistance: (1 - pinnedCitation.similarityScore).toFixed(4),
      sha256SourceHash: activePolicies.find((p) => p.title === pinnedCitation.documentTitle)
        ?.sha256Hash || 'sha256:0x89fd102...',
      rawPassage: pinnedCitation.rawText,
      groundingProof: 'HMAC_SHA256_PGVECTOR_RLS_VERIFIED',
    };
    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GroundTruth_Proof_${pinnedCitation.chunkId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-1.75rem)] bg-[#F8FAFC] text-[#0F172A] select-none overflow-hidden font-mono text-[12px] leading-tight">
      {/* 3-Column Workstation Container */}
      <div className="flex-1 grid grid-cols-12 divide-x divide-[#E2E8F0] h-full overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN (25% - 3 cols): ACTIVE POLICY INDEX */}
        {/* ========================================================= */}
        <div className="col-span-3 flex flex-col bg-[#FFFFFF] h-full overflow-hidden">
          {/* Column Header */}
          <div className="p-2.5 border-b border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-semibold text-[#0F172A] text-[11px] uppercase tracking-wider">
                Policy Index Ledger
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] font-mono tabular-nums">
              {filteredPolicies.length} Active
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-2 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-3 h-3 text-[#94A3B8] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                placeholder="Filter policies by code..."
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[3px] pl-7 pr-2.5 py-1 text-[11px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] font-mono"
              />
            </div>
            {selectedPolicy && (
              <div className="mt-1.5 flex items-center justify-between bg-[#EFF6FF] border border-[#BFDBFE] rounded-[2px] px-2 py-0.5 text-[10px] text-[#1D4ED8]">
                <span>Scope: {selectedPolicy.code}</span>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Policy List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0] p-1 bg-[#FFFFFF]">
            {filteredPolicies.map((pol) => {
              const isSelected = selectedPolicy?.id === pol.id;
              return (
                <div
                  key={pol.id}
                  onClick={() => {
                    setSelectedPolicy(pol);
                    setPinnedCitation(pol.defaultChunk);
                  }}
                  className={`p-2.5 transition-colors cursor-pointer rounded-[2px] group ${
                    isSelected
                      ? 'bg-[#EFF6FF] border-l-2 border-[#2563EB]'
                      : 'hover:bg-[#F8FAFC] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F172A] text-[11px] font-mono group-hover:text-[#2563EB]">
                      {pol.code}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] font-medium">
                      {pol.version}
                    </span>
                  </div>

                  <div className="text-[12px] text-[#475569] group-hover:text-[#0F172A] font-sans line-clamp-1 mb-1.5">
                    {pol.title}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
                    <span className="px-1 py-0.2 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] text-[9px]">
                      {pol.tag}
                    </span>
                    <span className="tabular-nums">{pol.chunkCount} Chunks &middot; {pol.lastSynced}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Footer Shard Status */}
          <div className="p-2 border-t border-[#E2E8F0] bg-[#FFFFFF] text-[10px] text-[#64748B] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#15803D] font-medium">
              <Lock className="w-2.5 h-2.5 text-[#16A34A]" />
              <span>RLS VERIFIED</span>
            </span>
            <span className="text-[#64748B]">{currentTenant.id}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN (50% - 6 cols): STRUCTURED INVESTIGATION TERMINAL */}
        {/* ========================================================= */}
        <div className="col-span-6 flex flex-col bg-[#F8FAFC] h-full overflow-hidden">
          {/* Telemetry Header */}
          <div className="h-9 border-b border-[#E2E8F0] bg-[#FFFFFF] px-3.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="font-semibold uppercase tracking-wider text-[#0F172A]">
                Investigation Terminal
              </span>
              <span className="text-[#CBD5E1]">|</span>
              <span className="text-[10px] text-[#64748B]">
                SCOPE: <strong className="text-[#2563EB] font-semibold">{selectedPolicy ? selectedPolicy.code : 'TENANT_ALL'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
              <span className="w-1.5 h-1.5 rounded-[1px] bg-[#16A34A]" />
              <span className="hidden sm:inline">HNSW-1536 Cosine Engine</span>
            </div>
          </div>

          {/* Investigation Output Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scroll-smooth bg-[#F8FAFC]">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[3px] p-3 space-y-2.5 font-mono text-[12px] shadow-sm"
              >
                {/* Query Header */}
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5 text-[10px] text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#2563EB] font-semibold uppercase">DISPATCH // {inv.id}</span>
                    <span className="text-[#CBD5E1]">&middot;</span>
                    <span className="tabular-nums">{inv.timestamp}</span>
                  </div>
                  <span className="text-[#64748B]">{user ? user.email : 'system-session'}</span>
                </div>

                {/* SQL/Terminal Style Query Block */}
                <div className="bg-[#F8FAFC] p-2 rounded-[2px] border border-[#E2E8F0] space-y-0.5">
                  <div className="text-[10px] text-[#64748B]">
                    &gt; SELECT ground_truth, synthesis FROM {currentTenant.id}.policies WHERE scope = &apos;{inv.scopedPolicyCode || 'ALL'}&apos;
                  </div>
                  <div className="text-[12px] text-[#0F172A] font-sans font-medium">
                    &ldquo;{inv.query}&rdquo;
                  </div>
                </div>

                {/* Synthesis Output Block */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#15803D] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                      SYNTHESIZED DIRECTIVE &middot; FAITHFULNESS {inv.telemetry.faithfulnessScore}%
                    </span>
                    <span className="text-[#64748B] font-mono tabular-nums">
                      TTFT: {inv.telemetry.ttftMs}ms &middot; Latency: {inv.telemetry.latencyMs}ms
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-2.5 rounded-[2px] border border-[#E2E8F0] text-[#0F172A] font-sans text-[12px] leading-relaxed whitespace-pre-wrap">
                    {inv.synthesis.split(/(\[REF-[A-Z]+-\d+\])/g).map((chunk, i) => {
                      if (chunk.startsWith('[REF-')) {
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              const found = inv.citations[0] || activePolicies[0].defaultChunk;
                              setPinnedCitation(found);
                            }}
                            className="inline-flex items-center gap-1 px-1 py-0.2 mx-1 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] hover:border-[#2563EB] text-[#1D4ED8] font-mono text-[10px] cursor-pointer transition-colors"
                            title="Inspect ground-truth chunk in right inspector"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>{chunk}</span>
                          </button>
                        );
                      }
                      return chunk;
                    })}
                    {inv.isStreaming && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-[#2563EB] animate-pulse align-middle" />
                    )}
                  </div>
                </div>

                {/* Grounding Signature & Telemetry Bar */}
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="flex items-center gap-1 text-[#15803D] font-semibold">
                        <ShieldCheck className="w-3 h-3 text-[#15803D]" />
                        <span>GROUNDED (RLS)</span>
                      </span>
                      <span className="text-[#E2E8F0]">|</span>
                      <span>
                        Latency: <strong className="text-[#0F172A]">{inv.telemetry.latencyMs}ms</strong>
                      </span>
                      <span className="text-[#E2E8F0] hidden sm:inline">|</span>
                      <span className="hidden sm:inline">
                        TTFT: <span className="text-[#2563EB]">{inv.telemetry.ttftMs}ms</span>
                      </span>
                      <span className="text-[#E2E8F0] hidden md:inline">|</span>
                      <span className="hidden md:inline">
                        Faithfulness: <span className="text-[#15803D]">{inv.telemetry.faithfulnessScore}%</span>
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedWaterfallId(expandedWaterfallId === inv.id ? null : inv.id)
                      }
                      className="flex items-center gap-1 text-[10px] text-[#2563EB] hover:text-[#1D4ED8] font-mono cursor-pointer transition-colors"
                    >
                      <span>Latency Trace</span>
                      {expandedWaterfallId === inv.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Waterfall Timeline */}
                  {expandedWaterfallId === inv.id && inv.telemetry.waterfall && (
                    <div className="p-2.5 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-[10px] font-mono animate-in fade-in">
                      <div className="flex items-center justify-between text-[#64748B] border-b border-[#E2E8F0] pb-1.5 text-[9px] uppercase tracking-wider">
                        <span>Pipeline Execution Trace Waterfall</span>
                        <span>Engine: pgvector-16.2 / HNSW 1536d Cosine</span>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="h-2 w-full bg-[#F1F5F9] rounded-[1px] overflow-hidden flex border border-[#E2E8F0]">
                        <div
                          style={{
                            width: `${(inv.telemetry.waterfall.tokenizeMs / inv.telemetry.latencyMs) * 100}%`,
                          }}
                          className="bg-[#94A3B8] h-full"
                          title={`Tokenizer: ${inv.telemetry.waterfall.tokenizeMs}ms`}
                        />
                        <div
                          style={{
                            width: `${(inv.telemetry.waterfall.piiScrubMs / inv.telemetry.latencyMs) * 100}%`,
                          }}
                          className="bg-[#F59E0B] h-full"
                          title={`PII Zero-Egress Guard: ${inv.telemetry.waterfall.piiScrubMs}ms`}
                        />
                        <div
                          style={{
                            width: `${(inv.telemetry.waterfall.vectorHnswMs / inv.telemetry.latencyMs) * 100}%`,
                          }}
                          className="bg-[#3B82F6] h-full"
                          title={`HNSW Search: ${inv.telemetry.waterfall.vectorHnswMs}ms`}
                        />
                        <div
                          style={{
                            width: `${(inv.telemetry.waterfall.crossEncoderMs / inv.telemetry.latencyMs) * 100}%`,
                          }}
                          className="bg-[#8B5CF6] h-full"
                          title={`Cross-Encoder Re-rank: ${inv.telemetry.waterfall.crossEncoderMs}ms`}
                        />
                        <div
                          style={{
                            width: `${(inv.telemetry.waterfall.modelTtftMs / inv.telemetry.latencyMs) * 100}%`,
                          }}
                          className="bg-[#10B981] h-full"
                          title={`Model TTFT: ${inv.telemetry.waterfall.modelTtftMs}ms`}
                        />
                      </div>

                      {/* Stage Breakdown Legend */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 text-[9px]">
                        <div className="p-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-0.5">
                          <div className="text-[#64748B] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#94A3B8] rounded-[1px]" />
                            <span>1. Tokenize</span>
                          </div>
                          <div className="font-bold text-[#0F172A] tabular-nums">
                            {inv.telemetry.waterfall.tokenizeMs}ms
                          </div>
                        </div>

                        <div className="p-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-0.5">
                          <div className="text-[#B45309] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-[1px]" />
                            <span>2. PII Scrub</span>
                          </div>
                          <div className="font-bold text-[#0F172A] tabular-nums">
                            {inv.telemetry.waterfall.piiScrubMs}ms
                          </div>
                        </div>

                        <div className="p-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-0.5">
                          <div className="text-[#2563EB] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-[1px]" />
                            <span>3. HNSW Search</span>
                          </div>
                          <div className="font-bold text-[#0F172A] tabular-nums">
                            {inv.telemetry.waterfall.vectorHnswMs}ms
                          </div>
                        </div>

                        <div className="p-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-0.5">
                          <div className="text-[#7C3AED] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-[1px]" />
                            <span>4. Re-Ranking</span>
                          </div>
                          <div className="font-bold text-[#0F172A] tabular-nums">
                            {inv.telemetry.waterfall.crossEncoderMs}ms
                          </div>
                        </div>

                        <div className="p-1.5 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] space-y-0.5">
                          <div className="text-[#15803D] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-[1px]" />
                            <span>5. Model TTFT</span>
                          </div>
                          <div className="font-bold text-[#15803D] tabular-nums">
                            {inv.telemetry.waterfall.modelTtftMs}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={terminalFeedEndRef} />
          </div>

          {/* Quick Query Selector Chips */}
          <div className="px-3 py-1.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-wrap gap-1.5 text-[11px]">
            <span className="text-[10px] text-[#64748B] self-center font-mono uppercase mr-1">
              Inquiries:
            </span>
            {(currentTenant.id === 't_acme_corp'
              ? [
                  'Production MFA and WebAuthn access rules',
                  'Meal per diem limits and receipt deadlines',
                  'Anti-bribery FCPA threshold for vendor gifts',
                ]
              : [
                  'Mandatory ePHI access controls & break-glass SOP',
                  'HITECH 7-year statutory retention & key shredding',
                  'Vendor BAA and SOC 2 requirements',
                ]
            ).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteQuery(q)}
                disabled={isExecuting}
                className="text-[11px] font-sans px-2 py-0.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1] hover:border-[#94A3B8] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer truncate max-w-xs disabled:opacity-50"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>

          {/* Prompt Terminal Input */}
          <div className="p-2.5 border-t border-[#E2E8F0] bg-[#FFFFFF]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteQuery(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <div className="absolute left-2.5 top-2 text-[#2563EB] text-[11px] font-mono font-bold select-none">
                  &gt;
                </div>
                <input
                  ref={queryInputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Execute policy query on ${currentTenant.name} (Cmd+K)...`}
                  disabled={isExecuting}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-[3px] pl-6 pr-16 py-1.5 text-[12px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] font-mono disabled:opacity-60"
                />
                <div className="absolute right-2 top-2 text-[10px] text-[#94A3B8] font-mono hidden sm:inline">
                  Enter ↵
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isExecuting}
                className="px-3 py-1.5 rounded-[3px] bg-[#0F172A] hover:bg-[#1E293B] border border-[#0F172A] text-white font-medium text-[11px] font-mono flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <span>Execute</span>
                <Send className="w-3 h-3 text-white" />
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (25% - 3 cols): MULTI-MODE INSPECTOR */}
        {/* ========================================================= */}
        <div className="col-span-3 flex flex-col bg-[#FFFFFF] h-full overflow-hidden">
          {/* Header & Tabs */}
          <div className="border-b border-[#E2E8F0] bg-[#FFFFFF]">
            <div className="p-2.5 flex items-center justify-between border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="font-semibold text-[#0F172A] text-[11px] uppercase tracking-wider">
                  Ground-Truth Inspector
                </span>
              </div>
              <span className="text-[10px] px-1 py-0.2 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-mono">
                CHUNK #{pinnedCitation.chunkId}
              </span>
            </div>

            {/* 3 Inspection Sub-Tabs */}
            <div className="flex items-center divide-x divide-[#E2E8F0] text-[10px] font-mono">
              <button
                onClick={() => setInspectorTab('PASSAGE')}
                className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                  inspectorTab === 'PASSAGE'
                    ? 'bg-[#F1F5F9] text-[#0F172A] font-bold border-b-2 border-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <FileText className="w-3 h-3 text-[#2563EB]" />
                <span>Passage</span>
              </button>
              <button
                onClick={() => setInspectorTab('PDF_VIEW')}
                className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                  inspectorTab === 'PDF_VIEW'
                    ? 'bg-[#F1F5F9] text-[#0F172A] font-bold border-b-2 border-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <FileCode className="w-3 h-3 text-[#B45309]" />
                <span>In-Situ PDF</span>
              </button>
              <button
                onClick={() => setInspectorTab('GRAPH')}
                className={`flex-1 py-1.5 px-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                  inspectorTab === 'GRAPH'
                    ? 'bg-[#F1F5F9] text-[#0F172A] font-bold border-b-2 border-[#2563EB]'
                    : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                <Network className="w-3 h-3 text-[#15803D]" />
                <span>Graph</span>
              </button>
            </div>
          </div>

          {/* Inspector Content by Tab */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {inspectorTab === 'PASSAGE' && (
              <>
                {/* Document Title & Section */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-semibold">
                    Source Document
                  </span>
                  <div className="text-[12px] text-[#0F172A] font-semibold font-sans">
                    {pinnedCitation.documentTitle}
                  </div>
                  <div className="text-[10px] text-[#2563EB] font-mono">
                    {pinnedCitation.section || 'General Governance Clause'}
                  </div>
                </div>

                {/* Verification Metadata Box */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[3px] p-2.5 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Page:</span>
                    <span className="text-[#0F172A] font-semibold tabular-nums">Page {pinnedCitation.page}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Cosine Distance:</span>
                    <span className="text-[#15803D] font-semibold tabular-nums">
                      {(1 - pinnedCitation.similarityScore).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Similarity Metric:</span>
                    <span className="text-[#0F172A] tabular-nums">
                      {(pinnedCitation.similarityScore * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Tenant Boundary:</span>
                    <span className="text-[#2563EB] font-medium">{currentTenant.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Shard Partition:</span>
                    <span className="text-[#0F172A]">{currentTenant.shardId || 'shard-us-east-4a'}</span>
                  </div>
                </div>

                {/* Source SHA-256 Hash */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-semibold">
                    Chunk SHA-256 Hash
                  </span>
                  <div className="p-2 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0] text-[10px] text-[#64748B] font-mono break-all leading-tight">
                    {activePolicies.find((p) => p.title.includes(pinnedCitation.documentTitle))
                      ?.sha256Hash || 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'}
                  </div>
                </div>

                {/* Verbatim Source Passage */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#64748B] uppercase tracking-wider block font-semibold">
                    Verbatim Extracted Chunk
                  </span>
                  <div className="p-2.5 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-sans text-[12px] leading-relaxed whitespace-pre-wrap select-text">
                    &ldquo;{pinnedCitation.rawText}&rdquo;
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: IN-SITU SIMULATED PDF VIEW */}
            {inspectorTab === 'PDF_VIEW' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>DOCUMENT PREVIEW // PAGE {pinnedCitation.page}</span>
                  <span className="text-[#15803D] font-bold">100% OCR VERIFIED</span>
                </div>

                {/* Simulated Paper Document Sheet */}
                <div className="p-4 rounded-[3px] bg-[#FFFFFF] border border-[#CBD5E1] shadow-sm space-y-3 relative overflow-hidden font-sans text-[11px] select-text">
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-2xl font-black uppercase rotate-[-25deg] text-[#0F172A]">
                    CONFIDENTIAL - {currentTenant.name}
                  </div>

                  {/* Document Stamp Header */}
                  <div className="border-b border-[#E2E8F0] pb-2 flex items-center justify-between text-[9px] font-mono text-[#64748B]">
                    <div>
                      <span className="font-bold text-[#0F172A] block">{pinnedCitation.documentTitle}</span>
                      <span>PAGE {pinnedCitation.page} &middot; REVISION 2026.4</span>
                    </div>
                    <div className="px-1.5 py-0.5 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
                      SEC-LEVEL: T1
                    </div>
                  </div>

                  {/* Surrounding Context Section 1 */}
                  <div className="text-[#64748B] text-[10px] leading-relaxed">
                    § 4.2 Scope of Operations — This operational protocol governs all cryptographic hardware keys, perimeter security boundaries, and corporate access control protocols under standard corporate oversight.
                  </div>

                  {/* Target Cited Passage Highlight Box */}
                  <div className="p-2.5 rounded-[3px] bg-[#FEF3C7]/60 border-l-2 border-[#D97706] space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#B45309] font-bold">
                      <span>CITED PASSAGE #{pinnedCitation.chunkId}</span>
                      <span>COSINE DIST: {(1 - pinnedCitation.similarityScore).toFixed(4)}</span>
                    </div>
                    <p className="text-[#0F172A] leading-relaxed font-medium">
                      {pinnedCitation.rawText}
                    </p>
                  </div>

                  {/* Surrounding Context Section 2 */}
                  <div className="text-[#64748B] text-[10px] leading-relaxed">
                    § 4.4 Non-Compliance Repercussions — Any attempt to circumvent identity boundary guards or access production shard partitions without prior approval triggers immediate revocation of role grants and logs an incident to the compliance audit database.
                  </div>

                  {/* Footer Stamp */}
                  <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[9px] font-mono text-[#94A3B8]">
                    <span>HASH: {pinnedCitation.rawText.substring(0, 24)}...</span>
                    <span>HMAC-SHA256 SIGNED</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INTERACTIVE KNOWLEDGE GRAPH */}
            {inspectorTab === 'GRAPH' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-[#64748B]">
                  <span>POLICY CLAUSE DEPENDENCY GRAPH</span>
                  <span className="text-[#2563EB] font-bold">INTERACTIVE</span>
                </div>

                <div className="p-2 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0]">
                  {/* SVG Policy Knowledge Graph */}
                  <svg viewBox="0 0 320 240" className="w-full h-56 select-none font-mono">
                    <defs>
                      <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#CBD5E1" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/* Connecting Edges */}
                    <line x1="160" y1="120" x2="60" y2="50" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="160" y1="120" x2="260" y2="50" stroke="#2563EB" strokeWidth="1.5" />
                    <line x1="160" y1="120" x2="60" y2="190" stroke="#CBD5E1" strokeWidth="1.5" />
                    <line x1="160" y1="120" x2="260" y2="190" stroke="#16A34A" strokeWidth="1.5" />
                    <line x1="260" y1="50" x2="260" y2="190" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

                    {/* Center Root Node */}
                    <circle cx="160" cy="120" r="26" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2" />
                    <text x="160" y="117" textAnchor="middle" fill="#0F172A" fontSize="8" fontWeight="bold">
                      {currentTenant.id.toUpperCase()}
                    </text>
                    <text x="160" y="128" textAnchor="middle" fill="#2563EB" fontSize="7">
                      VAULT
                    </text>

                    {/* Node 1: Top Left */}
                    <circle cx="60" cy="50" r="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <text x="60" y="48" textAnchor="middle" fill="#0F172A" fontSize="7" fontWeight="bold">
                      ISO27001
                    </text>
                    <text x="60" y="58" textAnchor="middle" fill="#64748B" fontSize="6">
                      CONTROLS
                    </text>

                    {/* Node 2: Top Right (Active Cited Policy) */}
                    <circle cx="260" cy="50" r="24" fill="#EFF6FF" stroke="#2563EB" strokeWidth="2" />
                    <text x="260" y="47" textAnchor="middle" fill="#0F172A" fontSize="7" fontWeight="bold">
                      ACTIVE
                    </text>
                    <text x="260" y="57" textAnchor="middle" fill="#2563EB" fontSize="6">
                      CHUNK #{pinnedCitation.chunkId}
                    </text>

                    {/* Node 3: Bottom Left */}
                    <circle cx="60" cy="190" r="20" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
                    <text x="60" y="188" textAnchor="middle" fill="#0F172A" fontSize="7" fontWeight="bold">
                      PII MASK
                    </text>
                    <text x="60" y="198" textAnchor="middle" fill="#B45309" fontSize="6">
                      LUHN/NID
                    </text>

                    {/* Node 4: Bottom Right */}
                    <circle cx="260" cy="190" r="22" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
                    <text x="260" y="188" textAnchor="middle" fill="#0F172A" fontSize="7" fontWeight="bold">
                      RLS LOCK
                    </text>
                    <text x="260" y="198" textAnchor="middle" fill="#15803D" fontSize="6">
                      ZERO LEAK
                    </text>
                  </svg>

                  <div className="p-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B] space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Cross-Referenced Directives:</span>
                      <span className="text-[#0F172A] font-bold">4 Nodes Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Regulatory Harmonization:</span>
                      <span className="text-[#15803D]">100% Policy Bound</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-2.5 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center gap-1.5">
            <button
              onClick={copyChunk}
              className="flex-1 py-1 px-2 rounded-[3px] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3 h-3 text-[#15803D]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#64748B]" />
                  <span>Copy Passage</span>
                </>
              )}
            </button>
            <button
              onClick={downloadCertificate}
              className="p-1 rounded-[3px] bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
              title="Download Signed Proof JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#2563EB]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

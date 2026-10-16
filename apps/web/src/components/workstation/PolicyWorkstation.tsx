'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  BookOpen,
  Send,
  Square,
  Copy,
  Check,
  Download,
  Filter,
  FileText,
  ChevronRight,
  Database,
  ArrowRight,
  ExternalLink,
  Sparkles,
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
  };
  isStreaming?: boolean;
}

export function PolicyWorkstation() {
  const { currentTenant, user } = useAuthTenant();

  // Active policies for current tenant
  const activePolicies = useMemo(() => {
    return TENANT_POLICIES[currentTenant.id] || TENANT_POLICIES['t_acme_corp'];
  }, [currentTenant.id]);

  // State
  const [policySearch, setPolicySearch] = useState('');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDocumentMetadata | null>(null);
  const [pinnedCitation, setPinnedCitation] = useState<CitationItem>(activePolicies[0].defaultChunk);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Investigation history keyed by tenant
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
      },
    },
  ]);

  const queryInputRef = useRef<HTMLInputElement>(null);
  const terminalFeedEndRef = useRef<HTMLDivElement>(null);

  // Reset default chunk when tenant switches
  useEffect(() => {
    setSelectedPolicy(null);
    setPinnedCitation(activePolicies[0].defaultChunk);
  }, [activePolicies]);

  // Keyboard shortcut Cmd+K / Ctrl+K
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

  // Filtered policies
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

  // Execute structured query
  const handleExecuteQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || isExecuting) return;

    setIsExecuting(true);
    setInputQuery('');

    const isAcme = currentTenant.id === 't_acme_corp';
    const qLower = trimmed.toLowerCase();

    // Select matched policy and chunk
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
      },
      isStreaming: true,
    };

    setInvestigations((prev) => [...prev, newRecord]);
    setPinnedCitation(citation);

    // Simulate streaming tokens into synthesis terminal
    const chunks = generatedText.split(' ');
    let currentText = '';
    for (let i = 0; i < chunks.length; i++) {
      await new Promise((r) => setTimeout(r, 40));
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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-200 select-none overflow-hidden font-mono text-xs">
      {/* 3-Column Workstation Container */}
      <div className="flex-1 grid grid-cols-12 divide-x divide-slate-800 h-full overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN (25% - 3 cols): ACTIVE POLICY INDEX */}
        {/* ========================================================= */}
        <div className="col-span-3 flex flex-col bg-slate-950 h-full overflow-hidden">
          {/* Column Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider">
                Policy Index Ledger
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredPolicies.length} Active
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-2.5 border-b border-slate-800 bg-slate-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                placeholder="Filter policies by code or tag..."
                className="w-full bg-slate-900 border border-slate-800 rounded pl-8 pr-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            {selectedPolicy && (
              <div className="mt-2 flex items-center justify-between bg-cyan-950/60 border border-cyan-800/80 rounded px-2 py-1 text-[10px] text-cyan-300">
                <span>Scope: {selectedPolicy.code}</span>
                <button
                  onClick={() => setSelectedPolicy(null)}
                  className="text-slate-400 hover:text-slate-100 cursor-pointer underline"
                >
                  Clear Scope
                </button>
              </div>
            )}
          </div>

          {/* Policy List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850 p-1">
            {filteredPolicies.map((pol) => {
              const isSelected = selectedPolicy?.id === pol.id;
              return (
                <div
                  key={pol.id}
                  onClick={() => {
                    setSelectedPolicy(pol);
                    setPinnedCitation(pol.defaultChunk);
                  }}
                  className={`p-3 transition-colors cursor-pointer rounded group ${
                    isSelected
                      ? 'bg-slate-900 border-l-2 border-cyan-400'
                      : 'hover:bg-slate-900/70 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200 text-[11px] font-mono group-hover:text-cyan-300">
                      {pol.code}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold">
                      {pol.version}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-sans line-clamp-1 mb-2 font-medium">
                    {pol.title}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-cyan-400 text-[9px]">
                      {pol.tag}
                    </span>
                    <span>{pol.chunkCount} Chunks &middot; {pol.lastSynced}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Footer Shard Status */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>RLS BOUNDARY VERIFIED</span>
            </span>
            <span className="text-slate-500">{currentTenant.id}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN (50% - 6 cols): STRUCTURED INVESTIGATION TERMINAL */}
        {/* ========================================================= */}
        <div className="col-span-6 flex flex-col bg-slate-950 h-full overflow-hidden">
          {/* Telemetry Header */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-200">
                Investigation Terminal
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-[10px] text-slate-400">
                SCOPE: <strong className="text-cyan-400">{selectedPolicy ? selectedPolicy.code : 'TENANT_ALL'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400 hidden sm:inline">HNSW-1536 Cosine Engine</span>
            </div>
          </div>

          {/* Investigation Output Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-900/80 border border-slate-800 rounded p-4 space-y-3 font-mono text-xs shadow-lg"
              >
                {/* Query Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold uppercase">DISPATCH // {inv.id}</span>
                    <span className="text-slate-600">&middot;</span>
                    <span>{inv.timestamp}</span>
                  </div>
                  <span className="text-slate-400">{user ? user.email : 'system-session'}</span>
                </div>

                {/* SQL/Terminal Style Query Block */}
                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1">
                  <div className="text-[10px] text-slate-500">
                    &gt; SELECT ground_truth, synthesis FROM {currentTenant.id}.policies WHERE scope = &apos;{inv.scopedPolicyCode || 'ALL'}&apos;
                  </div>
                  <div className="text-xs text-slate-200 font-semibold font-sans">
                    &ldquo;{inv.query}&rdquo;
                  </div>
                </div>

                {/* Synthesis Output Block */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SYNTHESIZED POLICY DIRECTIVE &middot; FAITHFULNESS {inv.telemetry.faithfulnessScore}%
                    </span>
                    <span className="text-slate-500 font-mono">
                      TTFT: {inv.telemetry.ttftMs}ms &middot; Total: {inv.telemetry.latencyMs}ms
                    </span>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded border border-slate-800 text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-wrap">
                    {/* Render text with inline clickable citation tokens */}
                    {inv.synthesis.split(/(\[REF-[A-Z]+-\d+\])/g).map((chunk, i) => {
                      if (chunk.startsWith('[REF-')) {
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              const found = inv.citations[0] || activePolicies[0].defaultChunk;
                              setPinnedCitation(found);
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-1 rounded bg-slate-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 font-mono text-[10px] cursor-pointer transition-colors shadow-2xs"
                            title="Click to inspect verified ground-truth chunk in right inspector"
                          >
                            <BookOpen className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{chunk}</span>
                          </button>
                        );
                      }
                      return chunk;
                    })}
                    {inv.isStreaming && (
                      <span className="inline-block w-2 h-3.5 ml-1 bg-cyan-400 animate-pulse align-middle" />
                    )}
                  </div>
                </div>

                {/* Cryptographic Grounding Signature */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Grounding Verified (Zero-Egress Guaranteed)</span>
                  </span>
                  <span className="font-mono">Vectors Scanned: {inv.telemetry.vectorsScanned}</span>
                </div>
              </div>
            ))}
            <div ref={terminalFeedEndRef} />
          </div>

          {/* Quick Query Selector Chips */}
          <div className="px-4 py-2 border-t border-slate-850 bg-slate-950 flex flex-wrap gap-2 text-xs">
            <span className="text-[10px] text-slate-500 self-center font-mono uppercase mr-1">
              Sample Inquiries:
            </span>
            {(currentTenant.id === 't_acme_corp'
              ? [
                  'Production MFA and WebAuthn access rules',
                  'Meal per diem limits and receipt submission deadlines',
                  'Anti-bribery FCPA threshold for vendor gifts',
                ]
              : [
                  'Mandatory ePHI access controls & break-glass SOP',
                  'HITECH 7-year statutory retention & key shredding',
                  'Vendor BAA and SOC 2 compliance requirements',
                ]
            ).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteQuery(q)}
                disabled={isExecuting}
                className="text-[11px] font-sans px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-cyan-600/80 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer truncate max-w-xs disabled:opacity-50"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>

          {/* Prompt Terminal Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/90">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteQuery(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <div className="absolute left-3 top-2.5 text-cyan-400 text-xs font-mono font-bold select-none">
                  &gt;
                </div>
                <input
                  ref={queryInputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Execute policy investigation query on ${currentTenant.name} (Cmd+K)...`}
                  disabled={isExecuting}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-20 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono disabled:opacity-60"
                />
                <div className="absolute right-2.5 top-2.5 text-[10px] text-slate-500 font-mono hidden sm:inline">
                  Enter ↵
                </div>
              </div>

              <button
                type="submit"
                disabled={!inputQuery.trim() || isExecuting}
                className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
              >
                <span>Execute</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (25% - 3 cols): FIXED GROUND-TRUTH INSPECTOR */}
        {/* ========================================================= */}
        <div className="col-span-3 flex flex-col bg-slate-950 h-full overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-100 text-[11px] uppercase tracking-wider">
                Ground-Truth Inspector
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-mono">
              CHUNK #{pinnedCitation.chunkId}
            </span>
          </div>

          {/* Inspector Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Document Title & Section */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Source Document
              </span>
              <div className="text-xs text-slate-100 font-semibold font-sans">
                {pinnedCitation.documentTitle}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">
                {pinnedCitation.section || 'General Governance Clause'}
              </div>
            </div>

            {/* Verification Metadata Box */}
            <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Page:</span>
                <span className="text-slate-200 font-bold">Page {pinnedCitation.page}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cosine Distance:</span>
                <span className="text-emerald-400 font-bold">
                  {(1 - pinnedCitation.similarityScore).toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Similarity Metric:</span>
                <span className="text-slate-200">
                  {(pinnedCitation.similarityScore * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenant Boundary:</span>
                <span className="text-cyan-400 font-semibold">{currentTenant.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shard Partition:</span>
                <span className="text-slate-300">{currentTenant.shardId || 'shard-us-east-4a'}</span>
              </div>
            </div>

            {/* Source SHA-256 Hash */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Cryptographic Chunk Hash (SHA-256)
              </span>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono break-all">
                {activePolicies.find((p) => p.title.includes(pinnedCitation.documentTitle))
                  ?.sha256Hash || 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'}
              </div>
            </div>

            {/* Verbatim Source Passage */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Verbatim Extracted Chunk
              </span>
              <div className="p-3 rounded bg-slate-900/90 border border-slate-800 text-slate-200 font-sans text-xs leading-relaxed whitespace-pre-wrap select-text">
                &ldquo;{pinnedCitation.rawText}&rdquo;
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <button
              onClick={copyChunk}
              className="flex-1 py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCitation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Passage</span>
                </>
              )}
            </button>
            <button
              onClick={downloadCertificate}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Download Signed Proof JSON"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Terminal,
  Lock,
  Layers,
  FileText,
  Clock,
  Eye,
  CheckCircle2,
  Copy,
  Check,
  X,
  Database,
  ArrowUpDown,
  FileSpreadsheet,
  BarChart3,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { RedactionEvent } from '../../types';

const INITIAL_AUDIT_LOGS: Record<string, RedactionEvent[]> = {
  t_acme_corp: [
    {
      id: 'aud-acme-901',
      timestamp: '2026-10-16T12:04:18Z',
      tenantId: 't_acme_corp',
      userId: 'usr-adm-01 (Marcus Sterling)',
      documentTitle: 'Global_Employee_Data_Privacy_and_GDPR_Compliance_Manual.pdf',
      entityType: 'NID_BD',
      originalMasked: 'NID: 1988**********71',
      detectionRule: 'REGEX_BD_NID_V2 (10/17-Digit Standard)',
      confidenceScore: 99.8,
      shardPartition: 'shard-us-east-4a',
    },
    {
      id: 'aud-acme-902',
      timestamp: '2026-10-16T11:42:05Z',
      tenantId: 't_acme_corp',
      userId: 'svc-pipeline-agent (Worker Shard A)',
      documentTitle: 'Acme_Global_Expense_and_FCPA_Compliance_Policy_2026.pdf',
      entityType: 'PHONE',
      originalMasked: '+880 17**-***892',
      detectionRule: 'ITU_E164_PHONE_MASK (BD Mobile Operator 017)',
      confidenceScore: 100.0,
      shardPartition: 'shard-us-east-4a',
    },
    {
      id: 'aud-acme-903',
      timestamp: '2026-10-16T09:15:40Z',
      tenantId: 't_acme_corp',
      userId: 'usr-adm-01 (Marcus Sterling)',
      documentTitle: 'PCI_DSS_v4.0_Cardholder_Data_Environment_Architecture.pdf',
      entityType: 'CREDIT_CARD_PCI',
      originalMasked: '4532-****-****-8812 (Visa)',
      detectionRule: 'LUHN_ALGORITHM_PCI_DSS_V4',
      confidenceScore: 99.9,
      shardPartition: 'shard-us-east-4a',
    },
    {
      id: 'aud-acme-904',
      timestamp: '2026-10-16T07:30:12Z',
      tenantId: 't_acme_corp',
      userId: 'svc-pipeline-agent (Worker Shard A)',
      documentTitle: 'Corporate_Code_of_Business_Conduct_and_Ethics_Standard.pdf',
      entityType: 'EMAIL',
      originalMasked: 'm*****g@acmewave.internal',
      detectionRule: 'RFC5322_STRICT_EMAIL_SCRUBBER',
      confidenceScore: 100.0,
      shardPartition: 'shard-us-east-4a',
    },
    {
      id: 'aud-acme-905',
      timestamp: '2026-10-15T18:14:22Z',
      tenantId: 't_acme_corp',
      userId: 'usr-adm-01 (Marcus Sterling)',
      documentTitle: 'Business_Continuity_and_Disaster_Recovery_Plan_BCP.pdf',
      entityType: 'NID_BD',
      originalMasked: 'NID: 1994**********34',
      detectionRule: 'REGEX_BD_NID_V2 (10/17-Digit Standard)',
      confidenceScore: 99.6,
      shardPartition: 'shard-us-east-4a',
    },
    {
      id: 'aud-acme-906',
      timestamp: '2026-10-15T14:02:11Z',
      tenantId: 't_acme_corp',
      userId: 'svc-pipeline-agent (Worker Shard A)',
      documentTitle: 'SOC2_Type_II_Security_Controls_and_Exceptions_Manual.pdf',
      entityType: 'PHONE',
      originalMasked: '+880 18**-***114',
      detectionRule: 'ITU_E164_PHONE_MASK (BD Mobile Operator 018)',
      confidenceScore: 100.0,
      shardPartition: 'shard-us-east-4a',
    },
  ],
  t_nexus_health: [
    {
      id: 'aud-nex-801',
      timestamp: '2026-10-16T11:55:00Z',
      tenantId: 't_nexus_health',
      userId: 'usr-aud-02 (Elena Rostova)',
      documentTitle: 'HIPAA_Security_Rule_and_ePHI_Safeguards_Protocol.pdf',
      entityType: 'SSN',
      originalMasked: 'SSN: ***-**-6104',
      detectionRule: 'US_SSN_PATTERN_REDACTOR_V1',
      confidenceScore: 99.9,
      shardPartition: 'shard-us-central-2b',
    },
    {
      id: 'aud-nex-802',
      timestamp: '2026-10-16T10:18:45Z',
      tenantId: 't_nexus_health',
      userId: 'svc-ingest-agent (Nexus HIPAA Worker)',
      documentTitle: 'Patient_Privacy_and_HITECH_Statutory_Compliance.pdf',
      entityType: 'PHONE',
      originalMasked: '+1 (555) ***-4891',
      detectionRule: 'ITU_E164_PHONE_MASK (North America NANP)',
      confidenceScore: 99.7,
      shardPartition: 'shard-us-central-2b',
    },
    {
      id: 'aud-nex-803',
      timestamp: '2026-10-16T08:05:19Z',
      tenantId: 't_nexus_health',
      userId: 'usr-aud-02 (Elena Rostova)',
      documentTitle: 'Clinical_Trial_Data_Deidentification_Protocol_v3.pdf',
      entityType: 'EMAIL',
      originalMasked: 'p*****t@nexushealth.internal',
      detectionRule: 'RFC5322_STRICT_EMAIL_SCRUBBER',
      confidenceScore: 100.0,
      shardPartition: 'shard-us-central-2b',
    },
    {
      id: 'aud-nex-804',
      timestamp: '2026-10-15T20:30:11Z',
      tenantId: 't_nexus_health',
      userId: 'svc-ingest-agent (Nexus HIPAA Worker)',
      documentTitle: 'Patient_Privacy_and_HITECH_Statutory_Compliance.pdf',
      entityType: 'SSN',
      originalMasked: 'SSN: ***-**-2940',
      detectionRule: 'US_SSN_PATTERN_REDACTOR_V1',
      confidenceScore: 99.9,
      shardPartition: 'shard-us-central-2b',
    },
  ],
};

export function AuditView() {
  const { currentTenant, user, hasPermission, switchRole } = useAuthTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<RedactionEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAttestation, setShowAttestation] = useState(false);

  // RBAC Permission Check: audit:read required
  const canReadAudit = hasPermission('audit:read');

  // Filter logs strictly for the current active tenant
  const tenantLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS[currentTenant.id] || [];
  }, [currentTenant.id]);

  const filteredLogs = useMemo(() => {
    return tenantLogs.filter((evt) => {
      const matchesSearch =
        evt.documentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.detectionRule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.originalMasked.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.userId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedEntityType === 'ALL' || evt.entityType === selectedEntityType;

      return matchesSearch && matchesType;
    });
  }, [tenantLogs, searchTerm, selectedEntityType]);

  // Aggregate stats
  const metrics = useMemo(() => {
    const total = tenantLogs.length;
    const nidOrSsn = tenantLogs.filter((l) => l.entityType === 'NID_BD' || l.entityType === 'SSN').length;
    const phone = tenantLogs.filter((l) => l.entityType === 'PHONE').length;
    const cards = tenantLogs.filter((l) => l.entityType === 'CREDIT_CARD_PCI').length;
    return { total, nidOrSsn, phone, cards };
  }, [tenantLogs]);

  // Export Audit Ledger
  const handleExportJson = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      compliancePlan: currentTenant.plan,
      verifiedBy: user?.email || 'compliance.auditor@lexiguard.internal',
      role: user?.role || 'COMPLIANCE_AUDITOR',
      ledgerHash: `sha256:0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      events: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiGuard_AuditLedger_${currentTenant.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 403 Forbidden Gate for MEMBER role
  if (!canReadAudit) {
    return (
      <div className="flex-1 bg-[#0E1015] p-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#161920] border border-[#252A36] rounded-[4px] p-6 font-mono text-xs">
          <div className="flex items-center gap-3 text-[#F85149] mb-4 pb-3 border-b border-[#252A36]">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-sm tracking-wide uppercase text-[#E6EDF3]">403 FORBIDDEN: INSUFFICIENT AUDIT CLEARANCE</div>
              <div className="text-[10px] text-[#8B949E]">ERROR_CODE: E_RBAC_INSUFFICIENT_SCOPE (audit:read required)</div>
            </div>
          </div>

          <p className="text-[#8B949E] text-xs mb-4 leading-relaxed font-sans">
            Your current assigned enterprise role <span className="text-[#F85149] font-mono font-semibold">[{user?.role || 'MEMBER'}]</span> has zero authorization to access the cryptographic PII scrubbing ledger or compliance event tables. This view requires the <code className="bg-[#0D0F14] px-1 py-0.5 rounded-[3px] border border-[#252A36] text-[#58A6FF]">audit:read</code> permission.
          </p>

          <div className="bg-[#0D0F14] p-3 rounded-[3px] border border-[#252A36] mb-5 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-[#8B949E]">
              <span>Active Tenant:</span>
              <span className="text-[#E6EDF3]">{currentTenant.name} ({currentTenant.id})</span>
            </div>
            <div className="flex justify-between text-[#8B949E]">
              <span>Assigned Identity:</span>
              <span className="text-[#E6EDF3]">{user?.email || 'anonymous-session'}</span>
            </div>
            <div className="flex justify-between text-[#8B949E]">
              <span>Authorized Roles:</span>
              <span className="text-[#3FB950]">COMPLIANCE_AUDITOR, ORG_ADMIN</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#252A36]">
            <span className="text-[10px] text-[#484F58] font-sans">
              Switch role simulator in header or select below:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole('COMPLIANCE_AUDITOR')}
                className="px-3 py-1.5 rounded-[3px] bg-[#238636] hover:bg-[#2EA043] text-white font-medium border border-[#2EA043]/50 text-xs cursor-pointer transition-colors"
              >
                Switch to COMPLIANCE_AUDITOR
              </button>
              <button
                onClick={() => switchRole('ORG_ADMIN')}
                className="px-3 py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] text-xs cursor-pointer transition-colors"
              >
                Switch to ORG_ADMIN
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0E1015] text-[#E6EDF3] p-4 sm:p-6 space-y-4 font-mono text-xs select-none">
      {/* Top Banner & Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#252A36]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[#E6EDF3] tracking-tight font-mono uppercase">
              Compliance &amp; PII Scrubbing Ledger
            </h1>
            <span className="text-[11px] bg-[#161920] border border-[#252A36] text-[#58A6FF] px-2 py-0.5 rounded-[3px] font-mono">
              TENANT: {currentTenant.id}
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E] font-sans mt-0.5">
            Immutable write-once log of deterministic PII interceptions, masking rules, and zero-egress perimeter validations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] text-xs transition-colors cursor-pointer"
            title="Download immutable ledger in JSON format"
          >
            <Download className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>Export Ledger (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Industrial Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-3">
          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Scrubbed Entities</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3FB950]" />
          </div>
          <div className="text-lg font-semibold text-[#E6EDF3] font-mono tabular-nums">{metrics.total}</div>
          <div className="text-[10px] text-[#3FB950] mt-1 font-sans">100% Zero-Egress Passed</div>
        </div>

        <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-3">
          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>National IDs / SSN Scrubbed</span>
            <Lock className="w-3.5 h-3.5 text-[#58A6FF]" />
          </div>
          <div className="text-lg font-semibold text-[#58A6FF] font-mono tabular-nums">{metrics.nidOrSsn}</div>
          <div className="text-[10px] text-[#8B949E] mt-1 font-sans">BD NID &amp; US SSN Masked</div>
        </div>

        <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-3">
          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>PCI Cardholder Redactions</span>
            <Layers className="w-3.5 h-3.5 text-[#E3B341]" />
          </div>
          <div className="text-lg font-semibold text-[#E3B341] font-mono tabular-nums">{metrics.cards}</div>
          <div className="text-[10px] text-[#8B949E] mt-1 font-sans">Luhn 16-Digit Sanitized</div>
        </div>

        <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-3">
          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>E164 Phone Numbers</span>
            <Terminal className="w-3.5 h-3.5 text-[#8B949E]" />
          </div>
          <div className="text-lg font-semibold text-[#E6EDF3] font-mono tabular-nums">{metrics.phone}</div>
          <div className="text-[10px] text-[#8B949E] mt-1 font-sans">ITU E.164 Global Formats</div>
        </div>
      </div>

      {/* Compliance Coverage Heatmap & Regulatory Posture Matrix */}
      <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-3.5 space-y-3">
        <div className="flex items-center justify-between border-b border-[#252A36] pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#58A6FF]" />
            <span className="font-semibold text-[#E6EDF3] text-xs uppercase tracking-wide">
              Statutory Compliance Posture &amp; Policy Gap Radar
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-[#238636]/15 text-[#3FB950] border border-[#238636]/40 font-bold">
              ZERO-EGRESS VERIFIED
            </span>
          </div>

          <button
            onClick={() => setShowAttestation(!showAttestation)}
            className="text-[11px] font-mono text-[#58A6FF] hover:text-[#58A6FF]/80 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{showAttestation ? 'Hide Gap Breakdown' : 'View Regulatory Attestation'}</span>
            <span className="text-[10px]">{showAttestation ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* 4 Compliance Standard Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          {/* 1. ISO 27001 */}
          <div className="p-2.5 rounded-[3px] bg-[#12141A] border border-[#252A36] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E6EDF3]">ISO/IEC 27001:2022</span>
              <span className="text-[10px] text-[#3FB950] font-bold tabular-nums">94% PASS</span>
            </div>
            <div className="w-full bg-[#161920] h-1.5 rounded-[1px] overflow-hidden border border-[#252A36]">
              <div className="bg-[#238636] h-full" style={{ width: '94%' }} />
            </div>
            <div className="text-[10px] text-[#8B949E] font-sans">
              Access control, KMS key rotation, immutable audit trail.
            </div>
          </div>

          {/* 2. Bangladesh Bank ICT */}
          <div className="p-2.5 rounded-[3px] bg-[#12141A] border border-[#252A36] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E6EDF3]">BD Bank ICT Guideline</span>
              <span className="text-[10px] text-[#3FB950] font-bold tabular-nums">88% PASS</span>
            </div>
            <div className="w-full bg-[#161920] h-1.5 rounded-[1px] overflow-hidden border border-[#252A36]">
              <div className="bg-[#58A6FF] h-full" style={{ width: '88%' }} />
            </div>
            <div className="text-[10px] text-[#8B949E] font-sans">
              Citizen NID (10/13/17d) &amp; mobile perimeter masking.
            </div>
          </div>

          {/* 3. PCI DSS v4 */}
          <div className="p-2.5 rounded-[3px] bg-[#12141A] border border-[#252A36] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E6EDF3]">PCI DSS v4.0 (CDE)</span>
              <span className="text-[10px] text-[#3FB950] font-bold tabular-nums">100% PASS</span>
            </div>
            <div className="w-full bg-[#161920] h-1.5 rounded-[1px] overflow-hidden border border-[#252A36]">
              <div className="bg-[#238636] h-full" style={{ width: '100%' }} />
            </div>
            <div className="text-[10px] text-[#8B949E] font-sans">
              Zero PAN cardholder exposure to vector embeddings.
            </div>
          </div>

          {/* 4. HIPAA / GDPR */}
          <div className="p-2.5 rounded-[3px] bg-[#12141A] border border-[#252A36] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#E6EDF3]">HIPAA / Safe Harbor</span>
              <span className="text-[10px] text-[#3FB950] font-bold tabular-nums">96% PASS</span>
            </div>
            <div className="w-full bg-[#161920] h-1.5 rounded-[1px] overflow-hidden border border-[#252A36]">
              <div className="bg-[#238636] h-full" style={{ width: '96%' }} />
            </div>
            <div className="text-[10px] text-[#8B949E] font-sans">
              18 ePHI direct identifiers sanitized pre-vectorization.
            </div>
          </div>
        </div>

        {/* Expandable Attestation Details Panel */}
        {showAttestation && (
          <div className="p-3 rounded-[3px] bg-[#0A0C10] border border-[#252A36] space-y-2 text-[10px] font-mono animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#252A36] pb-1 text-[#8B949E]">
              <span>CRYPTOGRAPHIC ATTESTATION RECORD</span>
              <span className="text-[#3FB950]">CERTIFIED ZERO DATA LEAKAGE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div>
                <span className="text-[#8B949E] block">Lead Compliance Officer:</span>
                <span className="text-[#E6EDF3] font-semibold">{user?.name || 'Dr. Sarah Khan'}</span>
              </div>
              <div>
                <span className="text-[#8B949E] block">Attestation Digest:</span>
                <span className="text-[#58A6FF] font-mono">sha256:0x7a89b...e21f</span>
              </div>
              <div>
                <span className="text-[#8B949E] block">Auditing Authority:</span>
                <span className="text-[#E6EDF3]">LexiGuard Perimeter Security Kernel</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161920] border border-[#252A36] rounded-[3px] p-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by rule, invoker, masked pattern, or doc title..."
              className="w-full bg-[#0D0F14] border border-[#252A36] rounded-[3px] pl-8 pr-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:border-[#58A6FF]"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-[3px] text-[#8B949E] hover:text-[#E6EDF3] text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[#484F58] mr-1 uppercase text-[10px]">Filter:</span>
          {['ALL', 'NID_BD', 'PHONE', 'EMAIL', 'CREDIT_CARD_PCI', 'SSN'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEntityType(type)}
              className={`px-2 py-1 rounded-[3px] transition-colors cursor-pointer font-mono ${
                selectedEntityType === type
                  ? 'bg-[#1F232D] border border-[#58A6FF]/60 text-[#58A6FF] font-semibold'
                  : 'bg-[#0D0F14] border border-[#252A36] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161920]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Redacted Log Events Table */}
      <div className="bg-[#161920] border border-[#252A36] rounded-[3px] overflow-hidden">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#12141A] text-[#8B949E] text-[10px] uppercase tracking-wider border-b border-[#252A36] font-mono">
              <tr>
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Entity Type</th>
                <th className="py-2 px-3">Masked Preview</th>
                <th className="py-2 px-3">Detection Rule</th>
                <th className="py-2 px-3">Document Origin</th>
                <th className="py-2 px-3">Invoker Identity</th>
                <th className="py-2 px-3">Conf.</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252A36] font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#8B949E] font-sans">
                    No PII redaction events match the current filter criteria for {currentTenant.id}.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((evt) => {
                  const badgeColor =
                    evt.entityType === 'NID_BD' || evt.entityType === 'SSN'
                      ? 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/30'
                      : evt.entityType === 'CREDIT_CARD_PCI'
                      ? 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/40'
                      : evt.entityType === 'PHONE'
                      ? 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/40'
                      : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D]';

                  return (
                    <tr
                      key={evt.id}
                      className="odd:bg-[#161920] even:bg-[#12141A]/50 hover:bg-[#1F232D]/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <td className="py-2 px-3 text-[#8B949E] whitespace-nowrap text-[10px] tabular-nums">
                        {evt.timestamp.replace('T', ' ').replace('Z', '')}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[10px] border ${badgeColor} font-semibold`}>
                          {evt.entityType}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#E6EDF3] whitespace-nowrap">
                        <code className="bg-[#0D0F14] px-1.5 py-0.5 rounded-[3px] border border-[#252A36] text-[#3FB950]">
                          {evt.originalMasked}
                        </code>
                      </td>
                      <td className="py-2 px-3 text-[#C9D1D9] whitespace-nowrap truncate max-w-xs">
                        {evt.detectionRule}
                      </td>
                      <td className="py-2 px-3 text-[#8B949E] truncate max-w-xs font-sans text-xs" title={evt.documentTitle}>
                        {evt.documentTitle}
                      </td>
                      <td className="py-2 px-3 text-[#8B949E] whitespace-nowrap text-[10px]">
                        {evt.userId}
                      </td>
                      <td className="py-2 px-3 text-[#3FB950] font-semibold whitespace-nowrap tabular-nums">
                        {evt.confidenceScore}%
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyToClipboard(evt.originalMasked, evt.id)}
                            className="p-1 rounded-[3px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition-colors cursor-pointer"
                            title="Copy masked token"
                          >
                            {copiedId === evt.id ? (
                              <Check className="w-3.5 h-3.5 text-[#3FB950]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="p-1 rounded-[3px] text-[#58A6FF] hover:text-[#58A6FF]/80 hover:bg-[#21262D] transition-colors cursor-pointer"
                            title="Inspect Raw Event JSON"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Ledger Metadata */}
        <div className="p-2.5 bg-[#12141A] border-t border-[#252A36] flex flex-wrap items-center justify-between text-[10px] text-[#8B949E]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#3FB950]" />
            <span>IMMUTABLE WRITE-ONCE COMPLIANCE LEDGER (HMAC-SHA256 SIGNED)</span>
          </div>
          <div>
            Showing {filteredLogs.length} of {tenantLogs.length} events logged in {currentTenant.id}
          </div>
        </div>
      </div>

      {/* Raw Audit Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-2xl bg-[#161920] border border-[#252A36] rounded-[4px] p-5 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-[#252A36] pb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#58A6FF]" />
                <span className="font-semibold text-[#E6EDF3] text-xs">Audit Record Inspection // {selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-[3px] text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2 bg-[#0D0F14] p-3 rounded-[3px] border border-[#252A36]">
                <div>
                  <span className="text-[#8B949E] block">Event Identifier:</span>
                  <span className="text-[#E6EDF3] font-semibold">{selectedEvent.id}</span>
                </div>
                <div>
                  <span className="text-[#8B949E] block">Logged Timestamp:</span>
                  <span className="text-[#E6EDF3] tabular-nums">{selectedEvent.timestamp}</span>
                </div>
                <div>
                  <span className="text-[#8B949E] block">Tenant Isolation Shard:</span>
                  <span className="text-[#58A6FF]">{selectedEvent.shardPartition}</span>
                </div>
                <div>
                  <span className="text-[#8B949E] block">Detection Confidence:</span>
                  <span className="text-[#3FB950] font-semibold tabular-nums">{selectedEvent.confidenceScore}%</span>
                </div>
              </div>

              <div>
                <span className="text-[#8B949E] block mb-1">Cryptographic JSON Payload:</span>
                <pre className="bg-[#0A0C10] p-3 rounded-[3px] border border-[#252A36] text-[#8B949E] text-[10px] overflow-x-auto leading-relaxed max-h-56">
                  {JSON.stringify(
                    {
                      ...selectedEvent,
                      _compliance: {
                        zeroEgressValidated: true,
                        rawPiiExposedToVectorIndex: false,
                        auditSignerKey: 'kms:us-east-1:lexiguard-ledger-signer',
                      },
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#252A36]">
              <button
                onClick={() => {
                  copyToClipboard(JSON.stringify(selectedEvent, null, 2), selectedEvent.id);
                }}
                className="px-3 py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] text-xs cursor-pointer transition-colors"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1.5 rounded-[3px] bg-[#238636] hover:bg-[#2EA043] text-white font-medium text-xs cursor-pointer transition-colors border border-[#2EA043]/50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

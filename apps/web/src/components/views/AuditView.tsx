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
      verifiedBy: user.email,
      role: user.role,
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
      <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-lg p-6 font-mono text-xs shadow-2xl">
          <div className="flex items-center gap-3 text-red-400 mb-4 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm tracking-wide">403 FORBIDDEN: INSUFFICIENT AUDIT CLEARANCE</div>
              <div className="text-[10px] text-slate-400">ERROR_CODE: E_RBAC_INSUFFICIENT_SCOPE (audit:read required)</div>
            </div>
          </div>

          <p className="text-slate-300 text-xs mb-4 leading-relaxed font-sans">
            Your current assigned enterprise role <span className="text-red-400 font-mono font-bold">[{user.role}]</span> has zero authorization to access the cryptographic PII scrubbing ledger or compliance event tables. This view requires the <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-700 text-cyan-400">audit:read</code> permission.
          </p>

          <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-5 space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>Active Tenant:</span>
              <span className="text-slate-200">{currentTenant.name} ({currentTenant.id})</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Assigned Identity:</span>
              <span className="text-slate-200">{user.email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Authorized Roles:</span>
              <span className="text-emerald-400">COMPLIANCE_AUDITOR, ORG_ADMIN</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-slate-500 font-sans">
              Switch role simulator in header or select below:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole('COMPLIANCE_AUDITOR')}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold border border-cyan-400 text-xs cursor-pointer transition-colors"
              >
                Switch to COMPLIANCE_AUDITOR
              </button>
              <button
                onClick={() => switchRole('ORG_ADMIN')}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs cursor-pointer transition-colors"
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
    <div className="flex-1 bg-slate-950 text-slate-200 p-4 sm:p-6 space-y-5 font-mono text-xs select-none">
      {/* Top Banner & Telemetry Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight font-mono uppercase">
              Compliance &amp; PII Scrubbing Ledger
            </h1>
            <span className="text-[10px] bg-slate-900 border border-slate-700 text-cyan-400 px-2 py-0.5 rounded font-mono">
              TENANT: {currentTenant.id}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Immutable write-once log of deterministic PII interceptions, masking rules, and zero-egress perimeter validations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 hover:border-slate-600 text-xs transition-colors cursor-pointer"
            title="Download immutable ledger in JSON format"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Ledger (.JSON)</span>
          </button>
        </div>
      </div>

      {/* Industrial Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Scrubbed Entities</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">{metrics.total}</div>
          <div className="text-[10px] text-emerald-400 mt-1 font-sans">100% Zero-Egress Passed</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>National IDs / SSN Scrubbed</span>
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-cyan-400 font-mono">{metrics.nidOrSsn}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">BD NID &amp; US SSN Masked</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>PCI Cardholder Redactions</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">{metrics.cards}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">Luhn 16-Digit Sanitized</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>E164 Phone Numbers</span>
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-400 font-mono">{metrics.phone}</div>
          <div className="text-[10px] text-slate-400 mt-1 font-sans">ITU E.164 Global Formats</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by rule, invoker, masked pattern, or doc title..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-500 mr-1 uppercase text-[10px]">Filter:</span>
          {['ALL', 'NID_BD', 'PHONE', 'EMAIL', 'CREDIT_CARD_PCI', 'SSN'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedEntityType(type)}
              className={`px-2 py-1 rounded transition-colors cursor-pointer font-mono ${
                selectedEntityType === type
                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Dense Redacted Log Events Table */}
      <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 font-mono">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Masked Preview</th>
                <th className="py-2.5 px-3">Detection Rule</th>
                <th className="py-2.5 px-3">Document Origin</th>
                <th className="py-2.5 px-3">Invoker Identity</th>
                <th className="py-2.5 px-3">Conf.</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No PII redaction events match the current filter criteria for {currentTenant.id}.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((evt) => {
                  const badgeColor =
                    evt.entityType === 'NID_BD' || evt.entityType === 'SSN'
                      ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800'
                      : evt.entityType === 'CREDIT_CARD_PCI'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : evt.entityType === 'PHONE'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : 'bg-indigo-950/80 text-indigo-400 border-indigo-800';

                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[10px]">
                        {evt.timestamp.replace('T', ' ').replace('Z', '')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${badgeColor} font-bold`}>
                          {evt.entityType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                        <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-emerald-300">
                          {evt.originalMasked}
                        </code>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap truncate max-w-xs">
                        {evt.detectionRule}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs font-sans text-xs" title={evt.documentTitle}>
                        {evt.documentTitle}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[10px]">
                        {evt.userId}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold whitespace-nowrap">
                        {evt.confidenceScore}%
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyToClipboard(evt.originalMasked, evt.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Copy masked token"
                          >
                            {copiedId === evt.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedEvent(evt)}
                            className="p-1 rounded text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
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
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>IMMUTABLE WRITE-ONCE COMPLIANCE LEDGER (HMAC-SHA256 SIGNED)</span>
          </div>
          <div>
            Showing {filteredLogs.length} of {tenantLogs.length} events logged in {currentTenant.id}
          </div>
        </div>
      </div>

      {/* Raw Audit Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-5 text-xs font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-slate-100 text-sm">Audit Record Inspection // {selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded border border-slate-850">
                <div>
                  <span className="text-slate-500 block">Event Identifier:</span>
                  <span className="text-slate-200 font-bold">{selectedEvent.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Logged Timestamp:</span>
                  <span className="text-slate-200">{selectedEvent.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tenant Isolation Shard:</span>
                  <span className="text-cyan-400">{selectedEvent.shardPartition}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Detection Confidence:</span>
                  <span className="text-emerald-400 font-bold">{selectedEvent.confidenceScore}%</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Cryptographic JSON Payload:</span>
                <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-300 text-[10px] overflow-x-auto leading-relaxed max-h-56">
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  copyToClipboard(JSON.stringify(selectedEvent, null, 2), selectedEvent.id);
                }}
                className="px-3 py-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs cursor-pointer"
              >
                Copy JSON
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
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

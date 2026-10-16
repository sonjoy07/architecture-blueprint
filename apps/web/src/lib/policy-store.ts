import { CitationItem } from '../types';

export interface PolicyDocumentMetadata {
  id: string;
  code: string;
  title: string;
  version: string;
  lastSynced: string;
  chunkCount: number;
  tag: string;
  sha256Hash: string;
  defaultChunk: CitationItem;
  rawText?: string;
  isCustom?: boolean;
}

export const INITIAL_TENANT_POLICIES: Record<string, PolicyDocumentMetadata[]> = {
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
      rawText:
        'All production systems, Cloud SQL databases, and Kubernetes clusters require hardware-backed WebAuthn/FIDO2 MFA authentication. Direct SSH access is strictly disabled; engineer access must transit through the Zero-Trust Identity-Aware Proxy (IAP) with ephemeral 4-hour role assignments approved via PagerDuty. Bastion SSH keys must rotate every 90 days. Root account credentials must remain in multi-party physical safes.',
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
      rawText:
        'Employee meal expenses during business travel are capped at $75.00 USD/day for standard metros and $100.00 USD/day for Tier-1 international cities. Original digitized VAT receipts must be uploaded within 30 calendar days via the finance portal. Alcohol is non-reimbursable without VP pre-authorization. Ground transportation exceeds $35 requires itemized receipts.',
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
      rawText:
        'Customer identity data entering tenant boundary t_acme_corp must pass deterministic PII tokenization filters before embedding generation. Unscrubbed PII must not be written to vector storage under any operational conditions. Data Subject Access Requests (DSAR) must be fulfilled within 30 days.',
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
      rawText:
        'PANs must be rendered unreadable anywhere they are stored using strong cryptography with associated key-management processes. Zero unmasked PAN digits may ever appear in log aggregates or vector metadata stores. Network segmentation between CDE and non-CDE is validated semi-annually.',
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
      rawText:
        'Gifts, entertainment, or gratuities extended to foreign government officials or commercial partners exceeding $50.00 USD must be logged in the Global Ethics Ledger and pre-cleared by Legal. Strict liability applies under Foreign Corrupt Practices Act provisions.',
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
      rawText:
        "Role-Based Access Control (RBAC) combined with Attribute-Based Access Control (ABAC) restricts electronic PHI queries exclusively to credentialed healthcare practitioners with active clinical assignments. Emergency 'break-glass' overrides generate real-time alerts to the compliance audit queue.",
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
      rawText:
        'Under HITECH Omnibus provisions, clinical trial documentation and patient disclosure ledgers must be retained for 7 years post-discharge. Decommissioning requires crypto-shredding of AES-256 partition keys verified by independent cryptographic auditor attestation.',
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
      rawText:
        'All third-party cloud hosting vendors and API providers handling patient records must execute a certified HIPAA Business Associate Agreement (BAA) with mandatory SOC 2 Type II attestation renewed every 12 months.',
    },
  ],
};

const STORAGE_KEY_PREFIX = 'lexiguard_policies_';

export function getTenantPolicies(tenantId: string): PolicyDocumentMetadata[] {
  if (typeof window === 'undefined') {
    return INITIAL_TENANT_POLICIES[tenantId] || [];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tenantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore parse error
  }
  return INITIAL_TENANT_POLICIES[tenantId] || [];
}

export function saveTenantPolicies(tenantId: string, policies: PolicyDocumentMetadata[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tenantId}`, JSON.stringify(policies));
    window.dispatchEvent(new CustomEvent('tenant-policies-updated', { detail: { tenantId } }));
  } catch (err) {
    console.error('Failed to save policies to localStorage:', err);
  }
}

export function addTenantPolicy(tenantId: string, policy: PolicyDocumentMetadata): void {
  const current = getTenantPolicies(tenantId);
  const updated = [policy, ...current.filter((p) => p.id !== policy.id)];
  saveTenantPolicies(tenantId, updated);
}

export function deleteTenantPolicy(tenantId: string, policyId: string): void {
  const current = getTenantPolicies(tenantId);
  const updated = current.filter((p) => p.id !== policyId);
  saveTenantPolicies(tenantId, updated);
}

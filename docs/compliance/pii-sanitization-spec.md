# Security & Observability Specification: PII Sanitization & Cloud Logging Compliance

| Attribute | Details |
|---|---|
| **Classification** | Enterprise Security & Compliance Technical Standard |
| **Regulations** | GDPR (Regulation EU 2016/679), HIPAA (45 CFR Part 160/164), SOC 2 CC6.1 |
| **Components** | `PiiRedactionService`, `SecureLogger` (Pino), GCP Cloud Logging |

---

## 1. Automated PII Redaction Pipeline (`PiiRedactionService`)

All unstructured text ingested into the Copilot platform traverses the `PiiRedactionService` prior to tokenization, vector embedding generation (`pgvector`), or transit to external LLM endpoints.

### Targeted PII Entities & Detection Logic
1. **Email Addresses:** RFC 5322 pattern matches and replaces with `[REDACTED_EMAIL]`.
2. **Phone Numbers:**
   - **Bangladesh Formats:** Full coverage of BD prefixes (`+8801[3-9]`, `8801[3-9]`, `01[3-9]`) across all telecom operators (Grameenphone, Banglalink, Robi/Airtel, Teletalk) with arbitrary spacing and hyphenation.
   - **International Formats:** E.164 and NANP (+1) patterns. Replaced with `[REDACTED_PHONE]`.
3. **National Identifiers:**
   - **US SSN:** Strict 9-digit hyphenated patterns (`\b\d{3}-\d{2}-\d{4}\b`) excluding invalid prefixes (000, 666, 900+).
   - **Bangladesh National ID (NID):** 10-digit Smart NID, 13-digit legacy NID, and 17-digit birth-year prefixed NID. Replaced with `[REDACTED_SSN_NID]`.
4. **Credit Card Numbers:**
   - Evaluates 13–19 digit candidate sequences.
   - **Mandatory Luhn (Mod-10) Validation:** Eliminates false positives from internal serial numbers, SKU codes, or database IDs. Replaced with `[REDACTED_CREDIT_CARD]`.

### Audit Trail Without Sensitive Data Storage
The service outputs a `RedactionAuditReport` alongside the clean text. For compliance traceability, the report generates one-way masked samples (e.g. `j***@corp.com`, `****-****-****-4242`) and total character count deltas. Raw PII is never stored in metadata or audit logs.

---

## 2. Secure Logger (`SecureLogger`) & GCP Cloud Logging Architecture

Application runtime logs emitted to `process.stdout` in JSON format are ingested by the GKE fluentbit/Google Cloud Logging agent into Cloud Logging.

```mermaid
flowchart LR
    A[NestJS Controller / Service] --> B[SecureLogger]
    B -->|Fast-Redact Path Filter| C{Sensitive Keys?}
    C -->|Authorization, Tokens, Passwords| D[Censor: '[REDACTED_BY_POLICY]']
    B -->|Regex String Sanitizer| E[Scrub inline Bearer, Phone, Email, Cards]
    D --> F[process.stdout JSON]
    E --> F
    F -->|Google Cloud Operations Agent| G[GCP Cloud Logging / Log Buckets]
    G -->|Lock Policy: 365 Days| H[Compliance Cold Storage]
```

### Why Automated In-Memory Redaction is Critical for GDPR & HIPAA Compliance

#### 1. GDPR Article 17 ("Right to be Forgotten" / Erasure)
- **The Conflict:** In immutable, write-once log retention stores (such as GCP Cloud Logging log buckets with Object Retention Lock), deleting individual log lines containing a user's email, name, or phone number is technically impossible without deleting the entire log bucket.
- **The Solution:** By scrubbing all identifiable personal information in application memory **before** writing to `stdout`, the retained logs in Cloud Logging are fully anonymized. They contain zero identifiable user records, fulfilling GDPR Article 17 requirements by design.

#### 2. HIPAA Security Rule (45 CFR § 164.312) & Privacy Rule
- **The Conflict:** Under HIPAA, transmitting Electronic Protected Health Information (ePHI)—including patient medical record numbers, phone numbers, SSNs, or email addresses—into unencrypted or broadly accessible application observability systems constitutes an unauthorized disclosure.
- **The Solution:** The `SecureLogger` strips both HTTP headers (Authorization bearer tokens, session cookies, API keys) and inline body PII. As a result, the Cloud Logging pipeline never ingests ePHI, preventing breach events under the HIPAA Breach Notification Rule (45 CFR §§ 164.400–414).

#### 3. GCP Native Severity Integration
The logger maps numeric log levels to standard Google Cloud Logging severity keys (`DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`), ensuring that Google Cloud Error Reporting and Cloud Monitoring alerting policies trigger automatically without custom log parsing.

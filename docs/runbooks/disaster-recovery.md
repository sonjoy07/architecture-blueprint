# Operational Runbook: Disaster Recovery & Database Restoration

| Attribute | Details |
|---|---|
| **Classification** | Critical Infrastructure Runbook (Sev-1 Disaster Recovery) |
| **Target RPO (Recovery Point Objective)** | < 24 Hours (Daily Encrypted Snapshot) / < 5 Minutes (Cloud SQL PITR) |
| **Target RTO (Recovery Time Objective)** | < 45 Minutes (Full Data Restoration) |
| **Storage Destination** | Google Cloud Storage (`gs://enterprise-copilot-documents-prod/backups/`) |
| **Encryption Standard** | AES-256-CBC with PBKDF2 Key Derivation (100,000 Iterations) |

---

## 1. Incident Triggers

Execute this disaster recovery procedure in the event of:
1. **Unrecoverable Cloud SQL Failure / Data Corruption:** Database instance failure where Point-In-Time Recovery (PITR) is unavailable or corrupt.
2. **Accidental Tenant Dropping:** Catastrophic multi-table truncation or administrative deletion requiring full cold restore.
3. **Cross-Region Infrastructure Failover:** Restoring production state in a secondary GCP region during complete regional outage.

---

## 2. Prerequisites & Access Verification

1. **GCP IAM Permissions:**
   - `roles/storage.objectViewer` on the GCS backup bucket.
   - `roles/cloudsql.admin` on target Cloud SQL instance.
   - `roles/secretmanager.secretAccessor` to retrieve the backup encryption passphrase.

2. **Required Tools on Bastion / Admin Terminal:**
   ```bash
   gcloud --version
   gsutil --version
   openssl version # Must support -pbkdf2 (OpenSSL 1.1.1+)
   psql --version   # PostgreSQL 16+ client
   ```

---

## 3. Step-by-Step Recovery Procedure

### Step 1: Identify and Download the Latest Verified Snapshot

List the available backup snapshots stored in the private GCS bucket:
```bash
gsutil ls -l gs://enterprise-copilot-documents-prod/backups/
```

Download the desired encrypted backup snapshot to a secure, ephemeral `/tmp` directory:
```bash
export BACKUP_NAME="copilot_pg_backup_20260930_020000.sql.gz.enc"
gsutil cp "gs://enterprise-copilot-documents-prod/backups/*/${BACKUP_NAME}" /tmp/${BACKUP_NAME}
```

### Step 2: Retrieve the Encryption Key from Secret Manager

Fetch the AES-256 passphrase securely from GCP Secret Manager (do not print to shell history):
```bash
export BACKUP_ENCRYPTION_KEY=$(gcloud secrets versions access latest \
  --secret="copilot-prod-backup-encryption-key" \
  --project="ENTERPRISE_GCP_PROJECT")
```

### Step 3: Decrypt and Decompress the Snapshot

Decrypt the file using AES-256-CBC with PBKDF2 (100,000 iterations):
```bash
# Decrypt AES-256 payload
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \
  -pass "env:BACKUP_ENCRYPTION_KEY" \
  -in "/tmp/${BACKUP_NAME}" \
  -out "/tmp/copilot_pg_backup.sql.gz"

# Decompress gzip stream
gunzip -f /tmp/copilot_pg_backup.sql.gz
```
*Note: Verify that `/tmp/copilot_pg_backup.sql` contains the standard PostgreSQL header (`-- PostgreSQL database dump`).*

### Step 4: Provision / Prepare Target Cloud SQL Instance

Ensure the target PostgreSQL 16+ instance has `pgvector` enabled and required extensions active:
```bash
export TARGET_DB_HOST="10.0.2.3"
export TARGET_DB_USER="copilot_prod_user"
export PGPASSWORD="<PROD_DB_PASSWORD>"

# Test database reachability
psql -h "${TARGET_DB_HOST}" -U "${TARGET_DB_USER}" -d "postgres" -c "SELECT version();"
```

### Step 5: Execute Database Restoration

Stream the SQL snapshot into the target database within a clean transaction:
```bash
psql -h "${TARGET_DB_HOST}" \
     -U "${TARGET_DB_USER}" \
     -d "enterprise_copilot_prod" \
     -v ON_ERROR_STOP=1 \
     -f "/tmp/copilot_pg_backup.sql"
```

### Step 6: Post-Restore Integrity & Security Verification

Execute the following verification queries to confirm table health, vector indexing, and Row-Level Security:

```sql
-- 1. Verify Extension Integrity
SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp', 'pg_trgm');

-- 2. Verify Table Row Counts
SELECT 'tenants' AS table_name, count(*) FROM tenants
UNION ALL
SELECT 'documents', count(*) FROM documents
UNION ALL
SELECT 'document_chunks', count(*) FROM document_chunks;

-- 3. Verify HNSW Vector Index Validity
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'document_chunks' AND indexname = 'idx_document_chunks_embedding_hnsw';

-- 4. CRITICAL: Verify Row-Level Security (RLS) Enforcement
SELECT relname, relrowsecurity, relforcerowsecurity 
FROM pg_class 
WHERE relname IN ('documents', 'document_chunks');
-- Expected: relrowsecurity = true AND relforcerowsecurity = true
```

### Step 7: Secure Cleanup

Securely wipe the unencrypted and encrypted files from local scratch disk:
```bash
shred -u -z /tmp/copilot_pg_backup.sql
shred -u -z /tmp/${BACKUP_NAME}
unset BACKUP_ENCRYPTION_KEY PGPASSWORD
```

### Step 8: Application Traffic Reconnection

1. Update the database URL secret in GCP Secret Manager if the target database host has changed:
   ```bash
   gcloud secrets versions add copilot-prod-database-url \
     --data-file="<NEW_CONNECTION_STRING>"
   ```
2. Trigger rolling restart of API pods:
   ```bash
   kubectl rollout restart deployment/copilot-api
   ```
3. Monitor error rates and latency in GCP Cloud Monitoring dashboards.

# TDR-001: Vector Storage Engine — PostgreSQL (pgvector + HNSW) vs. Dedicated Vector Databases

| Attribute | Details |
|---|---|
| **Status** | **APPROVED** |
| **Date** | 2026-09-30 |
| **Authors** | Principal Cloud Architect, Staff Backend Engineer (L4) |
| **Reviewers** | Head of Infrastructure, Lead Security & Compliance Officer |
| **Target System** | Multi-Tenant Enterprise Document & Policy Knowledge Copilot |
| **Decision Scope** | Vector embedding storage, similarity indexing, tenant isolation, and hybrid retrieval |

---

## 1. Context & Problem Statement

The platform is a multi-tenant enterprise document and policy knowledge copilot. It ingests confidential customer artifacts (PDFs, corporate policy manuals, standard operating procedures, contracts) and provides sub-second conversational retrieval-augmented generation (RAG) with strict regulatory compliance (SOC 2 Type II, ISO 27001, HIPAA-ready).

### Core Problem
Enterprise multi-tenancy mandates:
1. **Absolute Data Isolation:** Zero cross-tenant data leakage under any query path or failure condition.
2. **Transactional Consistency (ACID):** Atomic operations across document CRUD, permission ACL updates, and embedding updates. A document deleted or modified by an enterprise admin must instantaneously reflect in vector retrieval without eventual consistency lag.
3. **Complex Relational Metadata Filtering:** Retrieval queries must join similarity scores against dynamic, enterprise-grade access control lists (ACLs), user role permissions (RBAC/ABAC), document classification tags (e.g., Confidential, Restricted), and temporal validity ranges.
4. **Operational and Cost Predictability:** Minimizing architectural sprawl, avoiding redundant network boundaries, and controlling cloud egress and license costs at enterprise scale (10,000+ tenants, 50M+ vector embeddings).

---

## 2. Decision Drivers

| ID | Driver | Priority | Requirement |
|---|---|---|---|
| **DR-01** | Multi-Tenancy & Hard Isolation | **P0 (Critical)** | Hardware or kernel-enforced data partitioning; cryptographic or database engine-level query boundaries (PostgreSQL Row-Level Security). |
| **DR-02** | ACID & Referential Integrity | **P0 (Critical)** | Document metadata, vector chunks, document chunks, and audit records must be updated inside atomic database transactions. No ghost chunks or orphaned vectors after document deletion. |
| **DR-03** | Expressive Hybrid Filtering | **P1 (High)** | Combined lexical search (`tsvector` / BM25) and dense semantic vector search (`cosine` / `ip`), evaluated jointly with granular relational ACL filters in a single query execution plan. |
| **DR-04** | Total Cost of Ownership (TCO) | **P1 (High)** | Elimination of per-query SaaS surcharges, dedicated vector cluster node proliferation, and cross-VPC networking egress/ingress costs. |
| **DR-05** | Compliance & Data Sovereignty | **P0 (Critical)** | Data at rest encrypted with Customer-Managed Encryption Keys (CMEK) via GCP KMS within a private VPC network; no external SaaS boundary traversal. |
| **DR-06** | Operational Simplicity | **P2 (Medium)** | Standard backup, restore (PITR), replication, and snapshot pipelines leveraging existing enterprise DBA playbooks. |

---

## 3. Considered Options

We benchmarked three architectural approaches:
1. **Option A: PostgreSQL 16+ with `pgvector` (HNSW indexing) and native Row-Level Security (RLS)**
2. **Option B: Pinecone (Managed Serverless Vector SaaS)**
3. **Option C: Qdrant (Self-Hosted on GKE or Managed Cloud)**

### Comprehensive Architectural Comparison Matrix

| Evaluation Dimension | Option A: PostgreSQL + `pgvector` (0.7.0+) | Option B: Pinecone (Serverless) | Option C: Qdrant (Self-Hosted on GKE) |
|---|---|---|---|
| **Multi-Tenant Isolation** | **Native Kernel/Engine RLS**: Session variable `app.current_tenant_id` guarantees query-level confinement even if application code omits `WHERE tenant_id = ...`. | **Namespace-based**: Namespaces per tenant or metadata filtering (`tenant_id == x`). No engine-level cryptographic guarantee; bug in query construction causes tenant leakage. | **Payload-based Filtering**: Tenant filtering via boolean payload index or collection-per-tenant. Collection proliferation degrades cluster memory. |
| **Data Consistency & Transactions** | **Strict ACID (Serial / Read Committed)**: Single transaction deletes metadata, raw text, and vector embeddings. Zero orphan vectors. | **Eventual Consistency**: Two-phase writes (PostgreSQL for metadata, Pinecone API for vectors). Ingestion or deletion failures leave dangling vectors (ghost citations). | **Eventual / Tunable Consistency**: Separate DB + Vector DB dual-write problem. Requires distributed transaction or saga with outbox pattern. |
| **Metadata Filtering Power** | **Unrestricted Relational Power**: Native SQL `JOIN`s against permissions, organization hierarchy, document metadata, and temporal ranges. Combined `tsvector` + vector in one execution plan. | **Restricted Key-Value Filters**: Strict schema constraints, limited cardinality per metadata key, slow filtered vector search on high-cardinality metadata. | **Rich JSON Filtering**: Strong payload index support, but cannot perform relational joins to external permissions tables without denormalization. |
| **P99 Latency (1M–50M vectors)** | **8ms–22ms (HNSW in RAM)**; slightly degrades if index exceeds `shared_buffers` without adequate OS page cache. | **15ms–45ms** (Includes cross-cloud / public-to-private API gateway round-trip latency). | **5ms–18ms** (In-memory, optimized Rust binary running intra-cluster via gRPC). |
| **Infra & Operational Complexity** | **Zero Additional Infra**: Leverages existing Google Cloud SQL / AlloyDB HA instance. Reuses existing VPC peering, IAM, Point-In-Time Recovery (PITR), and Prometheus metrics. | **External SaaS**: Third-party compliance audit requirement (SOC 2 type II review, BAA/DPA signing, egress firewall rules, private link configuration). | **High**: Management of stateful set on GKE, Raft consensus orchestration, PVC snapshotting, memory balancing, and independent vector backup pipelines. |
| **Monthly Cost Profile (50M 1536-dim vectors)** | Included in Cloud SQL / AlloyDB instance (~$800–$1,400/mo for 16 vCPU, 64 GB RAM with SSD). | Variable usage: ~$3,200–$6,500/mo depending on read units, vector write units, and storage tiers. | Cluster footprint: 3 nodes (e2-standard-16) + persistent SSDs + monitoring = ~$1,900–$2,800/mo + DevOps labor. |

---

## 4. Decision

### Selected: Option A — PostgreSQL 16+ with `pgvector` extension and Row-Level Security (RLS)

We explicitly select **PostgreSQL with `pgvector` (using HNSW indexes)** as the foundational vector storage and similarity search engine for the Enterprise Copilot platform.

### Architectural Rationale & Concrete Mechanisms

#### 1. Native Row-Level Security (RLS) Enforces Zero-Trust Multi-Tenancy
Tenant isolation is enforced directly in the database engine via PostgreSQL RLS policies evaluated on every query. Even in the presence of an application-level SQL injection vulnerability or missing query parameters, unauthorized access across tenant boundaries is mathematically prevented by the PostgreSQL query planner.

```sql
-- DDL: Enable pgvector and configure multi-tenant schema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    search_tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', chunk_content)) STORED,
    embedding VECTOR(1536) NOT NULL, -- Matched to text-embedding-3-large / gemini-embedding
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Row-Level Security Activation
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings FORCE ROW LEVEL SECURITY;

-- Zero-bypass tenant isolation policy
CREATE POLICY tenant_isolation_policy ON document_embeddings
    AS RESTRICTIVE
    USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);
```

Before any query is executed by the NestJS data layer (via connection pooling), the session context is injected within the local transaction scope:

```sql
-- Executed per-request inside the acquired pool connection
SET LOCAL app.current_tenant_id = 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8';
```

#### 2. Elimination of the Dual-Write Distributed Inconsistency Problem
In dedicated vector databases (Pinecone, Qdrant), updating or deleting a document requires:
1. SQL transaction on primary metadata storage.
2. HTTP/gRPC remote call to vector database.
3. Redis worker job queue coordination.

Network partitions or worker crashes between step 1 and step 2 inevitably create "ghost vectors" (retrieved embeddings pointing to non-existent or stale documents) or un-indexed documents. With `pgvector`, document chunks, vector embeddings, relational ACLs, and compliance audit logs are committed or rolled back within an **atomic database transaction (`BEGIN...COMMIT`)**.

#### 3. Optimized HNSW Index Configuration
To achieve sub-20ms search latency on vector spaces up to 50 million rows, we utilize Hierarchical Navigable Small World (HNSW) graphs with cosine distance:

```sql
CREATE INDEX idx_document_embeddings_hnsw 
ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 128);

-- Full-text GIN index for hybrid lexical-semantic RRF retrieval
CREATE INDEX idx_document_embeddings_tsv ON document_embeddings USING gin(search_tsv);
CREATE INDEX idx_document_embeddings_tenant_doc ON document_embeddings(tenant_id, document_id);
```

Runtime retrieval tuning via connection-level configuration:
```sql
-- Configured dynamically in NestJS query runner based on SLA tier
SET LOCAL hnsw.ef_search = 64; -- Standard search (high speed: ~10ms)
-- OR
SET LOCAL hnsw.ef_search = 128; -- High precision compliance search (recall > 98%)
```

---

## 5. Architectural Trade-offs & Mitigations

| Trade-off / Limitation | Severity | Mitigation Strategy |
|---|---|---|
| **RAM Footprint of HNSW Indexes** | High | HNSW indexes must fit in memory (`shared_buffers` + OS disk cache) to avoid random NVMe I/O thrashing. <br>**Mitigation:** For an embedding dimension of 1536 and 10M vectors, HNSW index requires ~70 GB RAM. We size the Cloud SQL instance with 64–128 GB RAM and use Half-Precision (`halfvec` in pgvector 0.7+) when vector volume crosses 25M vectors, reducing RAM consumption by 50%. |
| **Index Build Duration & CPU Spike** | Medium | Creating or updating HNSW graphs under heavy ingest causes CPU spikes. <br>**Mitigation:** Worker ingestion pipelines leverage asynchronous BullMQ batch processing. New document vectors are inserted with `maintenance_work_mem = '2GB'` and parallel workers (`max_parallel_maintenance_workers = 4`). Bulk imports bypass index during load and index concurrently. |
| **Extreme Scale Vector Limits (>100M Vectors)** | Low | At >100M active vectors, monolithic PostgreSQL memory pressure scales faster than specialized sharded vector engines. <br>**Mitigation:** Implement PostgreSQL native declarative partitioning by `tenant_id` hash or range. This ensures HNSW indexes are localized to partition tables, enabling index pruning and targeted memory residency. |

---

## 6. Security & Compliance Implications

1. **Zero Egress Compliance:** Sensitive document text and vector embeddings never leave the GCP VPC boundary. All data remains inside private Cloud SQL instances behind Private Service Connect (PSC).
2. **Encryption:** Customer-Managed Encryption Keys (CMEK) via Google Cloud KMS encrypt storage at rest. In-transit traffic enforces TLS 1.3 with mandatory client certificate verification.
3. **Auditability:** Native PostgreSQL write-ahead logging (WAL) combined with audit extensions (`pgaudit`) captures exact tenant identification for every vector access, meeting SOC 2 CC6.1 and CC6.3 requirements.

---

## 7. Zero-Downtime Rollback & Migration Strategy

Should application scale exceed 100M vectors with requirements demanding specialized clustering features, the system adheres to a strict dual-read/write migration abstraction:

```mermaid
flowchart LR
    A[NestJS VectorRepository] --> B{VectorEngine Interface}
    B -->|Current Primary| C[PgVectorDriver (PostgreSQL + RLS)]
    B -->|Feature Flagged Driver| D[QdrantDriver (VPC Cluster)]
```

### Migration Phasing Plan
1. **Repository Abstraction:** All domain modules interface with an abstract `VectorStoreRepository` port (`searchSimilar()`, `upsertVectors()`, `deleteByDocument()`).
2. **Phase 1 (Shadow Write):** If migration is triggered, BullMQ ingestion workers dual-write to PostgreSQL and the target vector DB (e.g., Qdrant).
3. **Phase 2 (Backfill):** Offline worker reads historical vector chunks from Cloud SQL and backfills Qdrant collections partitioned by tenant ID.
4. **Phase 3 (Shadow Read & Verification):** Production queries run against PostgreSQL while executing asynchronous comparison reads against Qdrant to benchmark recall consistency and latency delta.
5. **Phase 4 (Cutover):** Toggle LaunchDarkly/ConfigMap flag `VECTOR_ENGINE_PRIMARY=qdrant`.
6. **Rollback Mechanism:** Since PostgreSQL retains the full historical dataset, live transactions, and RLS policies, cutback to `VECTOR_ENGINE_PRIMARY=pgvector` takes < 10 seconds via environment variable update without data loss.

---

## 8. Final Approval & Sign-Off

- **Principal Cloud Architect:** Signed (Architecture & Cost Architecture)
- **L4 Staff Backend Engineer:** Signed (Data Layer & NestJS Implementation)
- **Security & Compliance Lead:** Signed (Zero-Trust RLS & VPC Boundary)

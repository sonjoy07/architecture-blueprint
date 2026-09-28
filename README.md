# Multi-Tenant Enterprise Document & Policy Knowledge Copilot

[![CI/CD Pipeline](https://github.com/sonjoy07/architecture-blueprint/actions/workflows/ci.yml/badge.svg)](https://github.com/sonjoy07/architecture-blueprint/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/Node.js-20%20LTS-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![Compliance](https://img.shields.io/badge/Compliance-SOC%202%20Type%20II%20%7C%20HIPAA-purple.svg)](#security--compliance-architecture)

A production-grade, compliance-ready enterprise platform designed for multi-tenant conversational retrieval-augmented generation (RAG) over confidential corporate documents, policies, and standard operating procedures.

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Layer (apps/web)"]
        UI[Next.js 15 App Router]
        SSE[SSE Streaming Client]
        Drawer[Citation Slide-Over Drawer]
    end

    subgraph Gateway ["Perimeter & Ingress (k8s/manifests)"]
        WAF[Cloud Armor WAF]
        ING[HTTPS Ingress + TLS]
        RL[Tenant Rate Limiting & Quota Guard]
    end

    subgraph API ["Backend API (apps/api - NestJS Modular Monolith)"]
        MW[Tenant Context Middleware]
        PII[PiiRedactionService]
        CB[Opossum Circuit Breaker]
        RAG[RAG Orchestration Service]
        TB[TokenBudgetService (tiktoken)]
        TEL[GenAiTelemetryService (Langfuse/OTel)]
    end

    subgraph Queues ["Async Processing Layer"]
        BULL[BullMQ Ingestion Queue]
        WORKER[Ingestion Worker]
        DLQ[Dead-Letter Queue (DLQ)]
    end

    subgraph Data ["Storage & Vector Layer"]
        PG[(PostgreSQL 16 + pgvector + RLS)]
        REDIS[(Redis 7 Cluster)]
        GCS[(Google Cloud Storage / CMEK)]
    end

    UI -->|HTTP / SSE| WAF
    WAF --> ING
    ING --> RL
    RL --> MW
    MW --> API
    API -->|Async Jobs| BULL
    BULL --> WORKER
    WORKER --> PII
    WORKER -->|Batch Embeddings| CB
    WORKER -->|Atomic Transaction| PG
    WORKER -.->|Exhausted Retries| DLQ
    API -->|Hybrid RRF Query| PG
    API -->|Token Quota & Sliding Window| REDIS
    API -->|SSE Stream Tokens| SSE
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | NestJS (Modular Monolith, TypeScript), RxJS, Drizzle ORM, `pg` pool |
| **Frontend** | Next.js 15 (App Router), React 18, Tailwind CSS, Radix UI primitives |
| **Database & Vector** | PostgreSQL 16+ with `pgvector` (HNSW cosine index), Row-Level Security (RLS) |
| **Queue & Cache** | Redis 7 + BullMQ (Exponential backoff retry, Dead-Letter Queue) |
| **Observability** | Pino with automated PII & credential redaction, Langfuse/OTel telemetry, TTFT tracking |
| **Resilience & Guardrails**| Opossum Circuit Breaker, `js-tiktoken` token budgeting, automated faithfulness scoring |
| **Cloud & IaC** | Google Cloud Platform (GCP), Terraform (VPC, Cloud SQL, Secret Manager) |
| **Orchestration** | Kubernetes (GKE / K3s), Secrets Store CSI Driver, non-root multi-stage Docker containers |

---

## Repository Layout

```text
architecture-blueprint/
├── .github/workflows/ci.yml         # Enterprise CI/CD pipeline (Lint, Test, Trivy, TF, Docker)
├── apps/
│   ├── api/                         # NestJS Modular Monolith Backend
│   │   ├── Dockerfile               # Multi-stage non-root container (Node 20 Alpine)
│   │   └── src/
│   │       ├── common/              # Database pool, RLS transaction scoping, Pino logger, rate limiter
│   │       │   ├── database/        # PostgreSQL migrations (pgvector, RLS DDL), Drizzle schema
│   │       │   ├── guards/          # TenantRateLimitGuard (sliding window & token quota)
│   │       │   ├── logger/          # SecureLogger with automated PII/credential scrubbing
│   │       │   └── middleware/      # TenantContextMiddleware (AsyncLocalStorage boundary)
│   │       └── modules/
│   │           ├── documents/       # Upload controller (HTTP 202) & progress gateway
│   │           ├── queues/          # BullMQ queue service, ingestion worker, DLQ
│   │           ├── rag/             # Hybrid RRF retrieval, token budgeting, circuit breaker, telemetry
│   │           └── security/        # PiiRedactionService (Luhn check, BD phone/NID, SSN, Email)
│   └── web/                         # Next.js 15 App Router Frontend
│       ├── Dockerfile               # Standalone output optimized runner (<150MB)
│       └── src/
│           ├── app/                 # /copilot (Chat), /documents (Ingestion monitor)
│           ├── components/          # Chat interface, slide-over citation drawer, upload dropzone
│           ├── hooks/               # useCopilotStream (real-time SSE parser)
│           └── lib/                 # TenantContext (multi-tenant isolation switcher)
├── docs/
│   ├── compliance/                  # PII sanitization specification, GDPR/HIPAA mapping
│   ├── runbooks/                    # Disaster recovery & database restoration runbook
│   └── tdrs/
│       └── TDR-001-pgvector-vs-dedicated-vector-db.md # Vector engine architectural decision
├── k8s/manifests/                   # Kubernetes deployment, service, ingress, CSI secrets, backup cronjob
├── terraform/                       # GCP Infrastructure as Code
│   ├── environments/prod/           # Production composition & tfvars
│   └── modules/                     # vpc, cloud-sql (pgvector), secrets
├── docker-compose.yml               # Local development stack (Postgres, Redis, API, Web)
├── package.json                     # Root monorepo workspace configuration
├── pnpm-workspace.yaml              # Workspace package definitions
└── turbo.json                       # Turborepo build task pipeline
```

---

## Core Architectural Pillars

### 1. Cryptographic Multi-Tenancy with PostgreSQL RLS
Instead of relying on application-level `WHERE tenant_id = ...` clauses, tenant isolation is mathematically enforced by the database query planner via **Row-Level Security (RLS)**:
- Connection scoping executes `SELECT set_config('app.current_tenant_id', $1, true)` inside an explicit transaction (`is_local = true`).
- `FORCE ROW LEVEL SECURITY` prevents bypass even by table owners or non-superusers.
- Connection pool pollution is eliminated because the session variable automatically expires upon `COMMIT` or `ROLLBACK`.

### 2. pgvector with HNSW Indexing
As documented in [`docs/tdrs/TDR-001-pgvector-vs-dedicated-vector-db.md`](docs/tdrs/TDR-001-pgvector-vs-dedicated-vector-db.md):
- Hierarchical Navigable Small World (HNSW) index with cosine distance (`m = 16`, `ef_construction = 128`).
- Eliminates the distributed dual-write inconsistency and "ghost citation" problem of external vector SaaS databases.
- Sub-20ms P99 similarity search latency directly joinable with relational ACL permissions.

### 3. Perimeter PII Sanitization & Observability Masking
- [`PiiRedactionService`](apps/api/src/modules/security/pii-redaction.service.ts) scrubs email addresses, international and Bangladesh phone numbers, US SSN, BD National ID (10, 13, 17 digits), and credit card numbers (verified via Luhn check) before embeddings or LLM inference.
- [`SecureLogger`](apps/api/src/common/logger/secure-logger.ts) scrubs authorization headers, bearer tokens, API keys, and inline PII strings before writing to `process.stdout`, ensuring GDPR Article 17 ("Right to Erasure") and HIPAA compliance in immutable GCP Cloud Logging buckets.

### 4. Asynchronous Ingestion & Resilience
- **BullMQ + Redis:** Upload controller immediately returns `HTTP 202 Accepted` with a `jobId`. Heavy PDF parsing, chunking, and embedding run asynchronously in background workers.
- **Dead-Letter Queue (DLQ):** Unrecoverable failures after 5 exponential backoff retries (2s, 4s, 8s, 16s, 32s) are automatically routed to the DLQ and marked `FAILED` in the audit log.
- **Opossum Circuit Breaker:** External LLM endpoints are wrapped with a circuit breaker (10s timeout, 50% error threshold) with fallback to in-memory grounded synthesizers.

---

## Quickstart & Local Setup

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/) >= 9.0.0

### Running the Entire Stack via Docker Compose
```bash
# Clone repository
git clone https://github.com/sonjoy07/architecture-blueprint.git
cd architecture-blueprint

# Start PostgreSQL (pgvector), Redis, API, and Web
docker-compose up --build -d

# Verify running containers
docker-compose ps
```

- **Web Application:** [http://localhost:3001](http://localhost:3001)
- **API Health Endpoint:** [http://localhost:3000/health](http://localhost:3000/health)
- **PostgreSQL:** `localhost:5432` (`copilot_app_user` / `copilot_dev_password_123`)
- **Redis:** `localhost:6379`

### Local Development Setup
```bash
# 1. Install workspace dependencies
pnpm install

# 2. Run database & redis in background
docker-compose up postgres redis -d

# 3. Start Backend API (Watch Mode)
cd apps/api
npm run start:dev

# 4. Start Frontend Web (Port 3001)
cd ../web
npm run dev
```

---

## Testing & Verification

```bash
# Run backend tests
pnpm --filter @enterprise/api test

# Run code linting across monorepo
pnpm lint

# Terraform validation (Production configuration)
cd terraform/environments/prod
terraform init -backend=false
terraform validate
```

---

## Operational Documentation & Technical Decision Records

- **Technical Decision Record (Vector Storage):** [`docs/tdrs/TDR-001-pgvector-vs-dedicated-vector-db.md`](docs/tdrs/TDR-001-pgvector-vs-dedicated-vector-db.md)
- **PII Sanitization & Compliance Spec:** [`docs/compliance/pii-sanitization-spec.md`](docs/compliance/pii-sanitization-spec.md)
- **Disaster Recovery Runbook:** [`docs/runbooks/disaster-recovery.md`](docs/runbooks/disaster-recovery.md)
- **Terraform Infrastructure Guide:** [`terraform/README.md`](terraform/README.md)

-- ============================================================================
-- Migration: 001_initial_schema_and_rls.sql
-- Description: Core multi-tenant schema with pgvector, HNSW, GIN FTS, and RLS
-- Target: PostgreSQL 16+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Required PostgreSQL Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. Enumerated Types & Statuses
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('PENDING', 'PROCESSING', 'INDEXED', 'FAILED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 3. Core Tables
-- ----------------------------------------------------------------------------

-- Tenants: Root organization partition
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(64) NOT NULL DEFAULT 'ENTERPRISE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Users: Enterprise identities scoped to a tenant
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    role user_role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);

-- Documents: Ingested source files and corporate policies
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL,
    file_url TEXT NOT NULL,
    status document_status NOT NULL DEFAULT 'PENDING',
    pii_scrubbed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Document Chunks: Chunked text fragments with high-dimensional vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_document_chunk_order UNIQUE (document_id, chunk_index)
);

-- Audit Logs: Append-only compliance log (SOC 2 CC6.1 / HIPAA §164.312)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    resource VARCHAR(256) NOT NULL,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ----------------------------------------------------------------------------
-- 4. High-Performance Indexes
-- ----------------------------------------------------------------------------

-- HNSW Vector Index for sub-20ms Approximate Nearest Neighbor (ANN) search
-- vector_cosine_ops maps directly to cosine similarity for normalized embeddings
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw
ON document_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 128);

-- Full-Text Search (FTS) GIN Index for Hybrid Retrieval (BM25 + Semantic)
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts
ON document_chunks
USING gin (to_tsvector('english', content));

-- Trigram GIN Index for Substring / Exact Code & Policy Identifier Search
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_trgm
ON document_chunks
USING gin (content gin_trgm_ops);

-- B-Tree Indexes for Foreign Keys and Compound Partitioning
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_status ON documents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_doc ON document_chunks(tenant_id, document_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. Row-Level Security (RLS) Configuration
-- ----------------------------------------------------------------------------

-- Enable and FORCE Row-Level Security
-- FORCE ensures table owners and DB roles (except superusers) cannot bypass RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
DROP POLICY IF EXISTS tenant_isolation_document_chunks ON document_chunks;

-- Zero-Bypass Tenant Isolation Policy for 'documents'
-- Evaluates session variable 'app.current_tenant_id'
CREATE POLICY tenant_isolation_documents ON documents
    AS RESTRICTIVE
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    );

-- Zero-Bypass Tenant Isolation Policy for 'document_chunks'
CREATE POLICY tenant_isolation_document_chunks ON document_chunks
    AS RESTRICTIVE
    FOR ALL
    USING (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    )
    WITH CHECK (
        tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID
    );

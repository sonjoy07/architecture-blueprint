import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  inet,
  customType,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ----------------------------------------------------------------------------
// Custom pgvector type definition for Drizzle ORM
// ----------------------------------------------------------------------------
export const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    const dims = config?.dimensions ?? 1536;
    return `vector(${dims})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

// ----------------------------------------------------------------------------
// Enums
// ----------------------------------------------------------------------------
export const userRoleEnum = pgEnum('user_role', [
  'TENANT_ADMIN',
  'COMPLIANCE_OFFICER',
  'AUDITOR',
  'MEMBER',
]);

export const documentStatusEnum = pgEnum('document_status', [
  'PENDING',
  'PROCESSING',
  'INDEXED',
  'FAILED',
  'ARCHIVED',
]);

// ----------------------------------------------------------------------------
// Tables
// ----------------------------------------------------------------------------

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 64 }).default('ENTERPRISE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 320 }).notNull(),
    role: userRoleEnum('role').default('MEMBER').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_users_tenant_email').on(table.tenantId, table.email),
    index('idx_users_tenant_id').on(table.tenantId),
  ],
);

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 512 }).notNull(),
    fileUrl: text('file_url').notNull(),
    status: documentStatusEnum('status').default('PENDING').notNull(),
    piiScrubbed: boolean('pii_scrubbed').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_documents_tenant_status').on(table.tenantId, table.status),
  ],
);

export const documentChunks = pgTable(
  'document_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_document_chunk_order').on(table.documentId, table.chunkIndex),
    index('idx_document_chunks_tenant_doc').on(table.tenantId, table.documentId),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 128 }).notNull(),
    resource: varchar('resource', { length: 256 }).notNull(),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_logs_tenant_created').on(table.tenantId, table.createdAt),
  ],
);

// ----------------------------------------------------------------------------
// Relations
// ----------------------------------------------------------------------------
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  documents: many(documents),
  documentChunks: many(documentChunks),
  auditLogs: many(auditLogs),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [documents.tenantId],
    references: [tenants.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [documentChunks.tenantId],
    references: [tenants.id],
  }),
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));

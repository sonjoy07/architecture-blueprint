import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { DatabaseService } from '../../common/database/database.service';
import { PiiRedactionService } from '../security/pii-redaction.service';
import { DocumentIngestionService } from '../rag/document-ingestion.service';
import { IngestionQueueService } from './ingestion.queue.service';
import { DocumentProgressGateway } from '../documents/document-progress.gateway';
import {
  DOCUMENT_INGESTION_QUEUE,
  DocumentIngestionJobData,
  IngestionProgressEvent,
} from './queue.constants';

@Injectable()
export class IngestionWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionWorker.name);
  private worker!: Worker<DocumentIngestionJobData>;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly piiRedactionService: PiiRedactionService,
    private readonly ingestionService: DocumentIngestionService,
    private readonly queueService: IngestionQueueService,
    private readonly progressGateway: DocumentProgressGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    const connection = (this.queueService as any).getRedisConnection();

    this.worker = new Worker<DocumentIngestionJobData>(
      DOCUMENT_INGESTION_QUEUE,
      async (job: Job<DocumentIngestionJobData>) => {
        await this.processJob(job);
      },
      {
        connection,
        concurrency: parseInt(process.env.INGESTION_CONCURRENCY || '5', 10),
        limiter: {
          max: 50,
          duration: 1000, // Max 50 jobs per second per node to throttle downstream DB & LLM
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Worker completed job [${job.id}] for document [${job.data.documentId}]`);
    });

    this.worker.on('failed', async (job, err) => {
      if (!job) return;
      this.logger.warn(
        `Job [${job.id}] attempt ${job.attemptsMade}/${job.opts.attempts} failed: ${err.message}`,
      );

      // Route to Dead-Letter Queue (DLQ) if maximum retries reached
      if (job.attemptsMade >= (job.opts.attempts || 5)) {
        await this.handleDeadLetterFailure(job, err);
      }
    });

    this.logger.log('BullMQ IngestionWorker initialized and listening for tasks.');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
    }
  }

  /**
   * Complete pipeline: PDF/Text Parse -> PII Scrub -> Semantic Chunking -> Vector Embedding -> RLS DB Commit.
   */
  private async processJob(job: Job<DocumentIngestionJobData>): Promise<void> {
    const { documentId, tenantId, title, rawText, fileBufferBase64, metadata } = job.data;
    const jobId = job.id as string;

    this.emitProgress(jobId, documentId, tenantId, 'PARSING', 15, 'Extracting document text payload...');

    // 1. Resolve raw document text
    let documentContent = rawText || '';
    if (!documentContent && fileBufferBase64) {
      const buffer = Buffer.from(fileBufferBase64, 'base64');
      documentContent = this.extractTextFromBuffer(buffer, title);
    }

    if (!documentContent.trim()) {
      throw new Error(`Document content is empty for document ${documentId}`);
    }

    // 2. Mark database record as PROCESSING
    await this.databaseService.withTenantTransaction(async (client) => {
      await client.query(
        `UPDATE documents SET status = 'PROCESSING' WHERE id = $1`,
        [documentId],
      );
    }, tenantId);

    // 3. Automated PII Sanitization
    this.emitProgress(jobId, documentId, tenantId, 'PII_SCRUBBING', 35, 'Scrubbing PII, SSN, NID, and financial credentials...');
    const { cleanText, auditReport } = this.piiRedactionService.redact(documentContent);

    // 4. Semantic Header-Aware Chunking
    this.emitProgress(jobId, documentId, tenantId, 'CHUNKING', 55, 'Generating semantic chunks with hierarchical headers...');
    const chunks = this.ingestionService.createSemanticChunks(cleanText, title, 1, 1800, 300);

    // 5. Generate Dense Vector Embeddings (1536-dim)
    this.emitProgress(jobId, documentId, tenantId, 'EMBEDDING', 75, `Generating embeddings for ${chunks.length} chunks...`);
    const embeddings = await this.ingestionService.generateBatchEmbeddings(chunks.map((c) => c.content));

    // 6. Atomic Tenant Transaction: Insert Chunks, Update Doc, and Write Audit Log
    this.emitProgress(jobId, documentId, tenantId, 'INDEXING', 90, 'Committing chunks to PostgreSQL pgvector with RLS...');
    await this.databaseService.withTenantTransaction(async (client) => {
      // Clean any stale chunks
      await client.query(`DELETE FROM document_chunks WHERE document_id = $1`, [documentId]);

      // Batch insert chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = embeddings[i];

        await client.query(
          `INSERT INTO document_chunks (
            tenant_id,
            document_id,
            chunk_index,
            content,
            embedding,
            metadata
          ) VALUES (
            NULLIF(current_setting('app.current_tenant_id', true), '')::UUID,
            $1,
            $2,
            $3,
            $4::vector,
            $5
          )`,
          [
            documentId,
            chunk.chunkIndex,
            chunk.content,
            JSON.stringify(embedding),
            JSON.stringify({ ...chunk.metadata, ...metadata, piiAudit: auditReport }),
          ],
        );
      }

      // Mark Document as Indexed & PII Scrubbed
      await client.query(
        `UPDATE documents 
         SET status = 'INDEXED', pii_scrubbed = true 
         WHERE id = $1`,
        [documentId],
      );

      // Write immutable audit log
      await client.query(
        `INSERT INTO audit_logs (tenant_id, action, resource)
         VALUES (NULLIF(current_setting('app.current_tenant_id', true), '')::UUID, $1, $2)`,
        [
          'DOCUMENT_INGESTION_COMPLETED',
          `Document: ${title} (${documentId}), Chunks: ${chunks.length}`,
        ],
      );
    }, tenantId);

    // 7. Complete Progress
    this.emitProgress(
      jobId,
      documentId,
      tenantId,
      'COMPLETED',
      100,
      `Document successfully indexed into vector knowledge base (${chunks.length} chunks).`,
    );
  }

  /**
   * Terminal Failure: Moves document to Dead-Letter Queue and marks status FAILED.
   */
  private async handleDeadLetterFailure(
    job: Job<DocumentIngestionJobData>,
    err: Error,
  ): Promise<void> {
    const { documentId, tenantId, title } = job.data;
    const jobId = job.id as string;

    try {
      // 1. Move to BullMQ DLQ
      await this.queueService.sendToDeadLetterQueue(job.data, err.message);

      // 2. Mark database status FAILED
      await this.databaseService.withTenantTransaction(async (client) => {
        await client.query(
          `UPDATE documents SET status = 'FAILED' WHERE id = $1`,
          [documentId],
        );

        await client.query(
          `INSERT INTO audit_logs (tenant_id, action, resource)
           VALUES (NULLIF(current_setting('app.current_tenant_id', true), '')::UUID, $1, $2)`,
          [
            'DOCUMENT_INGESTION_DLQ_FAILED',
            `Document ${title} (${documentId}) failed permanently: ${err.message}`,
          ],
        );
      }, tenantId);

      // 3. Emit Failure Event to UI
      this.progressGateway.emitProgress({
        jobId,
        documentId,
        tenantId,
        stage: 'FAILED',
        progressPercentage: 100,
        message: `Permanent ingestion failure: ${err.message}`,
        timestamp: new Date().toISOString(),
        error: err.message,
      });
    } catch (fatalDbErr) {
      this.logger.error(`Critical error while handling DLQ routing`, (fatalDbErr as Error).stack);
    }
  }

  private extractTextFromBuffer(buffer: Buffer, title: string): string {
    // UTF-8 fallback / plain text / markdown
    // In production, integrate with pdf-parse or Apache Tika
    return buffer.toString('utf-8');
  }

  private emitProgress(
    jobId: string,
    documentId: string,
    tenantId: string,
    stage: IngestionProgressEvent['stage'],
    progressPercentage: number,
    message: string,
  ): void {
    this.progressGateway.emitProgress({
      jobId,
      documentId,
      tenantId,
      stage,
      progressPercentage,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, JobsOptions } from 'bullmq';
import {
  DOCUMENT_INGESTION_QUEUE,
  DOCUMENT_INGESTION_DLQ,
  DocumentIngestionJobData,
} from './queue.constants';

@Injectable()
export class IngestionQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionQueueService.name);
  private ingestionQueue!: Queue<DocumentIngestionJobData>;
  private deadLetterQueue!: Queue<DocumentIngestionJobData & { failureReason: string; failedAt: string }>;

  private getRedisConnection() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const parsed = new URL(redisUrl);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '6379', 10),
        password: parsed.password || undefined,
        tls: parsed.protocol === 'rediss:' ? {} : undefined,
      };
    }

    return {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    };
  }

  async onModuleInit(): Promise<void> {
    const connection = this.getRedisConnection();

    // 1. Primary Ingestion Queue with Exponential Backoff
    this.ingestionQueue = new Queue<DocumentIngestionJobData>(DOCUMENT_INGESTION_QUEUE, {
      connection,
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2s, 4s, 8s, 16s, 32s
        },
        removeOnComplete: {
          age: 86400, // Retain 24 hours
          count: 5000,
        },
        removeOnFail: false, // Retain for DLQ routing and audit inspection
      },
    });

    // 2. Dead-Letter Queue (DLQ)
    this.deadLetterQueue = new Queue(DOCUMENT_INGESTION_DLQ, {
      connection,
      defaultJobOptions: {
        removeOnComplete: false,
        removeOnFail: false,
      },
    });

    this.logger.log('BullMQ queues initialized: Document Ingestion Queue & Dead-Letter Queue (DLQ).');
  }

  async onModuleDestroy(): Promise<void> {
    await this.ingestionQueue.close();
    await this.deadLetterQueue.close();
  }

  /**
   * Enqueues document for asynchronous parsing, PII redaction, and vector embedding.
   */
  async enqueueDocument(data: DocumentIngestionJobData, customOpts?: JobsOptions): Promise<string> {
    const job = await this.ingestionQueue.add('process-document', data, {
      jobId: data.jobId,
      ...customOpts,
    });

    this.logger.log(
      `Job [${job.id}] enqueued for document [${data.documentId}] under tenant [${data.tenantId}].`,
    );

    return job.id as string;
  }

  /**
   * Routes irreversibly failed jobs into Dead-Letter Queue (DLQ).
   */
  async sendToDeadLetterQueue(
    data: DocumentIngestionJobData,
    failureReason: string,
  ): Promise<string> {
    const dlqJob = await this.deadLetterQueue.add('dead-letter-document', {
      ...data,
      failureReason,
      failedAt: new Date().toISOString(),
    });

    this.logger.error(
      `CRITICAL: Document [${data.documentId}] moved to Dead-Letter Queue (DLQ Job: ${dlqJob.id}). Reason: ${failureReason}`,
    );

    return dlqJob.id as string;
  }

  getIngestionQueue(): Queue<DocumentIngestionJobData> {
    return this.ingestionQueue;
  }

  getDeadLetterQueue(): Queue<any> {
    return this.deadLetterQueue;
  }
}

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseInterceptors,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatabaseService } from '../../common/database/database.service';
import { TenantContextService } from '../../common/database/tenant-context.service';
import { IngestionQueueService } from '../queues/ingestion.queue.service';
import { DocumentProgressGateway } from './document-progress.gateway';
import { TenantTransactionInterceptor } from '../../common/interceptors/tenant-transaction.interceptor';

export class UploadDocumentDto {
  title!: string;
  fileUrl?: string;
  rawContent?: string;
  fileBase64?: string;
  metadata?: Record<string, any>;
}

@Controller('api/v1/documents')
@UseInterceptors(TenantTransactionInterceptor)
export class DocumentUploadController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tenantContextService: TenantContextService,
    private readonly queueService: IngestionQueueService,
    private readonly progressGateway: DocumentProgressGateway,
  ) {}

  /**
   * Asynchronous Document Ingestion Endpoint.
   * Returns HTTP 202 Accepted immediately with jobId and status URL.
   */
  @Post('upload')
  @HttpCode(HttpStatus.ACCEPTED)
  async uploadDocument(@Body() dto: UploadDocumentDto) {
    if (!dto.title || (!dto.rawContent && !dto.fileBase64 && !dto.fileUrl)) {
      throw new BadRequestException('Document title and text or file content are required.');
    }

    const tenantId = this.tenantContextService.getTenantId();
    const context = this.tenantContextService.getContext();

    // 1. Create initial document record with status PENDING inside tenant RLS boundary
    const docResult = await this.databaseService.withTenantTransaction(async (client) => {
      const res = await client.query<{ id: string }>(
        `INSERT INTO documents (
          tenant_id,
          title,
          file_url,
          status,
          pii_scrubbed
        ) VALUES (
          NULLIF(current_setting('app.current_tenant_id', true), '')::UUID,
          $1,
          $2,
          'PENDING',
          false
        ) RETURNING id`,
        [dto.title, dto.fileUrl || `vault://${tenantId}/${Date.now()}`],
      );

      // Audit log entry
      await client.query(
        `INSERT INTO audit_logs (tenant_id, user_id, action, resource)
         VALUES (NULLIF(current_setting('app.current_tenant_id', true), '')::UUID, $1, $2, $3)`,
        [context?.userId || null, 'DOCUMENT_UPLOAD_QUEUED', `DocID: ${res.rows[0].id} (${dto.title})`],
      );

      return res.rows[0];
    }, tenantId);

    const documentId = docResult.id;
    const jobId = `job-${documentId}-${Date.now()}`;

    // 2. Enqueue background ingestion job in BullMQ
    await this.queueService.enqueueDocument({
      jobId,
      documentId,
      tenantId,
      title: dto.title,
      fileUrl: dto.fileUrl || '',
      rawText: dto.rawContent,
      fileBufferBase64: dto.fileBase64,
      metadata: dto.metadata,
      submittedBy: context?.userId,
      createdAt: new Date().toISOString(),
    });

    // 3. Return HTTP 202 Accepted
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Document accepted for asynchronous ingestion and vectorization.',
      jobId,
      documentId,
      statusUrl: `/api/v1/documents/${documentId}/status`,
      progressStreamUrl: `/api/v1/documents/${documentId}/progress`,
    };
  }

  /**
   * Real-time progress SSE stream for a specific document.
   */
  @Sse(':id/progress')
  streamProgress(@Param('id') documentId: string): Observable<MessageEvent> {
    const tenantId = this.tenantContextService.getTenantId();

    return this.progressGateway.getProgressStream(tenantId, documentId).pipe(
      map((event) => ({
        type: 'progress',
        data: event,
      } as MessageEvent)),
    );
  }
}

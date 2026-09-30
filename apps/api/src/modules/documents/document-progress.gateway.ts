import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IngestionProgressEvent } from '../queues/queue.constants';

@Injectable()
export class DocumentProgressGateway {
  private readonly logger = new Logger(DocumentProgressGateway.name);
  private readonly progress$ = new Subject<IngestionProgressEvent>();

  /**
   * Emits a progress update from background worker to connected clients.
   */
  emitProgress(event: IngestionProgressEvent): void {
    this.logger.debug(
      `[Job ${event.jobId}] Progress ${event.progressPercentage}% - ${event.stage}: ${event.message}`,
    );
    this.progress$.next(event);
  }

  /**
   * Returns an Observable stream filtered by specific document ID or tenant ID for SSE/WebSocket subscribers.
   */
  getProgressStream(tenantId: string, documentId?: string): Observable<IngestionProgressEvent> {
    return this.progress$.asObservable().pipe(
      filter((evt) => {
        if (evt.tenantId !== tenantId) return false;
        if (documentId && evt.documentId !== documentId) return false;
        return true;
      }),
    );
  }
}

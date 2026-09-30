import { Module, Global } from '@nestjs/common';
import { IngestionQueueService } from './ingestion.queue.service';
import { IngestionWorker } from './ingestion.worker';
import { SecurityModule } from '../security/security.module';
import { DatabaseModule } from '../../common/database/database.module';
import { RagModule } from '../rag/rag.module';
import { DocumentProgressGateway } from '../documents/document-progress.gateway';

@Global()
@Module({
  imports: [DatabaseModule, SecurityModule, RagModule],
  providers: [
    DocumentProgressGateway,
    IngestionQueueService,
    IngestionWorker,
  ],
  exports: [
    DocumentProgressGateway,
    IngestionQueueService,
    IngestionWorker,
  ],
})
export class QueuesModule {}

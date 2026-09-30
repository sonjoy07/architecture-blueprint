import { Module } from '@nestjs/common';
import { DocumentUploadController } from './document-upload.controller';
import { DocumentProgressGateway } from './document-progress.gateway';
import { QueuesModule } from '../queues/queues.module';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule, QueuesModule],
  controllers: [DocumentUploadController],
  providers: [DocumentProgressGateway],
  exports: [DocumentProgressGateway],
})
export class DocumentsModule {}

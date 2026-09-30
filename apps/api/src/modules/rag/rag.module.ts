import { Module } from '@nestjs/common';
import { DocumentIngestionService } from './document-ingestion.service';
import { HybridRetrievalService } from './hybrid-retrieval.service';
import { ContextGuardrailsService } from './context-guardrails.service';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { SecurityModule } from '../security/security.module';
import { DatabaseModule } from '../../common/database/database.module';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [CopilotController],
  providers: [
    DocumentIngestionService,
    HybridRetrievalService,
    ContextGuardrailsService,
    CopilotService,
  ],
  exports: [
    DocumentIngestionService,
    HybridRetrievalService,
    ContextGuardrailsService,
    CopilotService,
  ],
})
export class RagModule {}

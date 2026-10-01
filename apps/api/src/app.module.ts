import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { DatabaseModule } from './common/database/database.module';
import { SecurityModule } from './modules/security/security.module';
import { RagModule } from './modules/rag/rag.module';
import { QueuesModule } from './modules/queues/queues.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    RagModule,
    QueuesModule,
    DocumentsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply TenantContextMiddleware to all routes except public health checks
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}

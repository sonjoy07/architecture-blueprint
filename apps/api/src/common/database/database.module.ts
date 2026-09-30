import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TenantContextService } from './tenant-context.service';
import { TenantContextMiddleware } from '../middleware/tenant-context.middleware';
import { TenantTransactionInterceptor } from '../interceptors/tenant-transaction.interceptor';

@Global()
@Module({
  providers: [
    TenantContextService,
    DatabaseService,
    TenantContextMiddleware,
    TenantTransactionInterceptor,
  ],
  exports: [
    TenantContextService,
    DatabaseService,
    TenantContextMiddleware,
    TenantTransactionInterceptor,
  ],
})
export class DatabaseModule {}

import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TenantContextService } from './tenant-context.service';
import { TenantContextMiddleware } from '../middleware/tenant-context.middleware';
import { TenantTransactionInterceptor } from '../interceptors/tenant-transaction.interceptor';
import { RateLimitService } from '../services/rate-limit.service';
import { TenantRateLimitGuard } from '../guards/tenant-rate-limit.guard';

@Global()
@Module({
  providers: [
    TenantContextService,
    DatabaseService,
    TenantContextMiddleware,
    TenantTransactionInterceptor,
    RateLimitService,
    TenantRateLimitGuard,
  ],
  exports: [
    TenantContextService,
    DatabaseService,
    TenantContextMiddleware,
    TenantTransactionInterceptor,
    RateLimitService,
    TenantRateLimitGuard,
  ],
})
export class DatabaseModule {}

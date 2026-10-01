import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { TenantContextService } from '../database/tenant-context.service';

/**
 * TenantTransactionInterceptor
 * Wraps route execution inside a PostgreSQL transaction with:
 * `set_config('app.current_tenant_id', $1, true)`
 * 
 * Attaches the scoped transactional PoolClient to the incoming Request object
 * as `req.tenantDbClient` so controllers and repositories can reuse the exact connection.
 */
@Injectable()
export class TenantTransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantTransactionInterceptor.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();

    // Bypass non-HTTP contexts (e.g. Microservices, BullMQ processors manage their own scope)
    if (!req) {
      return next.handle();
    }

    const tenantId = this.tenantContextService.getTenantId();

    return from(
      this.databaseService.withTenantTransaction(async (client) => {
        // Expose transactional client to request scope for repositories
        req.tenantDbClient = client;

        // Execute controller action and await resolution within the active transaction
        return await next.handle().toPromise();
      }, tenantId),
    );
  }
}

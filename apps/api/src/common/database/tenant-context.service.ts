import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContextPayload {
  tenantId: string;
  userId?: string;
  role?: string;
}

@Injectable()
export class TenantContextService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<TenantContextPayload>();

  /**
   * Runs a synchronous or asynchronous callback within the scoped tenant context.
   */
  run<R>(context: TenantContextPayload, callback: () => R): R {
    return this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Retrieves the current tenant ID. Throws if context is uninitialized.
   */
  getTenantId(): string {
    const store = this.asyncLocalStorage.getStore();
    if (!store?.tenantId) {
      throw new Error('Tenant context is not initialized for the current execution thread.');
    }
    return store.tenantId;
  }

  /**
   * Retrieves the full context store if available.
   */
  getContext(): TenantContextPayload | undefined {
    return this.asyncLocalStorage.getStore();
  }
}

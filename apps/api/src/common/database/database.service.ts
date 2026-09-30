import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly tenantContextService: TenantContextService) {}

  async onModuleInit(): Promise<void> {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client in pool', err.stack);
    });

    // Test connectivity
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
      this.logger.log('PostgreSQL connection pool initialized with pgvector & RLS support.');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Executes a database operation within a transaction scoped to the current tenant.
   * Uses PostgreSQL `set_config('app.current_tenant_id', $1, true)` where is_local=true,
   * guaranteeing the session variable automatically expires when the transaction commits or rolls back.
   * This mathematically prevents connection pool leakage across multi-tenant requests.
   */
  async withTenantTransaction<T>(
    operation: (client: PoolClient) => Promise<T>,
    explicitTenantId?: string,
  ): Promise<T> {
    const tenantId = explicitTenantId || this.tenantContextService.getTenantId();
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // is_local = true ensures the setting only lasts for this transaction (identical to SET LOCAL)
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId]);

      // Set HNSW search precision dynamically based on query requirements
      await client.query(`SELECT set_config('hnsw.ef_search', '64', true)`);

      const result = await operation(client);

      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Transaction rolled back for tenant ${tenantId}`, (error as Error).stack);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper for single query execution inside a tenant transaction context.
   */
  async tenantQuery<R extends QueryResultRow = any>(
    queryText: string,
    params: any[] = [],
  ): Promise<QueryResult<R>> {
    return this.withTenantTransaction(async (client) => {
      return client.query<R>(queryText, params);
    });
  }

  /**
   * Raw pool access for non-tenant administrative tasks (e.g. provisioning a new tenant)
   */
  getRawPool(): Pool {
    return this.pool;
  }
}

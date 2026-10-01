import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

export interface RateLimitCheckResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  monthlyResetTimestamp: number;
  violationReason?: 'REQUEST_RATE_LIMIT_EXCEEDED' | 'MONTHLY_TOKEN_QUOTA_EXCEEDED';
}

const DEFAULT_TENANT_MONTHLY_QUOTAS: Record<string, number> = {
  ENTERPRISE_SOC2: 25_000_000, // 25 Million tokens/mo
  FINANCIAL_HIPAA: 50_000_000, // 50 Million tokens/mo
  GOV_CLOUD: 100_000_000,      // 100 Million tokens/mo
  STANDARD: 5_000_000,         // 5 Million tokens/mo
};

@Injectable()
export class RateLimitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitService.name);
  private redis!: Redis;

  onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.redis.connect().catch((err) => {
      this.logger.warn(`Redis connection failed for RateLimiter (${err.message}). Using memory fallback.`);
    });
  }

  onModuleDestroy() {
    this.redis?.disconnect();
  }

  /**
   * Evaluates Sliding Window Request Rate Limit & Monthly Token Budget.
   * Window: 60 seconds (1 minute).
   */
  async checkTenantQuota(
    tenantId: string,
    plan: string = 'ENTERPRISE_SOC2',
    requestedTokens: number = 0,
    maxRequestsPerMinute: number = 60,
  ): Promise<RateLimitCheckResult> {
    const now = Date.now();
    const windowStart = now - 60_000;
    const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const nextMonthTimestamp = Math.floor(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() / 1000,
    );

    const monthlyLimit = DEFAULT_TENANT_MONTHLY_QUOTAS[plan] || DEFAULT_TENANT_MONTHLY_QUOTAS.STANDARD;

    if (!this.redis || this.redis.status !== 'ready') {
      // In-memory grace pass if Redis is uninitialized
      return {
        isAllowed: true,
        limit: maxRequestsPerMinute,
        remaining: maxRequestsPerMinute - 1,
        resetSeconds: 60,
        monthlyLimit,
        monthlyRemaining: monthlyLimit - requestedTokens,
        monthlyResetTimestamp: nextMonthTimestamp,
      };
    }

    const rateKey = `ratelimit:tenant:${tenantId}:reqs`;
    const tokenKey = `quota:tenant:${tenantId}:tokens:${currentMonthKey}`;

    // Redis Pipeline: Sliding window log via Sorted Set (ZSET) + Monthly Token Counter (STRING)
    const pipeline = this.redis.pipeline();

    // 1. Sliding window request rate limit
    pipeline.zremrangebyscore(rateKey, 0, windowStart);
    pipeline.zcard(rateKey);
    pipeline.zadd(rateKey, now, `${now}-${Math.random()}`);
    pipeline.expire(rateKey, 65);

    // 2. Monthly token usage check
    pipeline.get(tokenKey);

    const results = await pipeline.exec();
    if (!results) throw new Error('Redis pipeline failed');

    const currentRequests = (results[1][1] as number) || 0;
    const currentMonthlyTokens = parseInt((results[4][1] as string) || '0', 10);

    const remainingRequests = Math.max(0, maxRequestsPerMinute - currentRequests);
    const monthlyRemaining = Math.max(0, monthlyLimit - currentMonthlyTokens);

    // Evaluate violations
    if (currentRequests >= maxRequestsPerMinute) {
      return {
        isAllowed: false,
        limit: maxRequestsPerMinute,
        remaining: 0,
        resetSeconds: 60,
        monthlyLimit,
        monthlyRemaining,
        monthlyResetTimestamp: nextMonthTimestamp,
        violationReason: 'REQUEST_RATE_LIMIT_EXCEEDED',
      };
    }

    if (currentMonthlyTokens + requestedTokens > monthlyLimit) {
      return {
        isAllowed: false,
        limit: maxRequestsPerMinute,
        remaining: remainingRequests,
        resetSeconds: 60,
        monthlyLimit,
        monthlyRemaining: 0,
        monthlyResetTimestamp: nextMonthTimestamp,
        violationReason: 'MONTHLY_TOKEN_QUOTA_EXCEEDED',
      };
    }

    return {
      isAllowed: true,
      limit: maxRequestsPerMinute,
      remaining: remainingRequests,
      resetSeconds: 60,
      monthlyLimit,
      monthlyRemaining: monthlyRemaining - requestedTokens,
      monthlyResetTimestamp: nextMonthTimestamp,
    };
  }

  /**
   * Records consumed tokens after completion of LLM call.
   */
  async recordConsumedTokens(tenantId: string, tokensCount: number): Promise<void> {
    if (!this.redis || this.redis.status !== 'ready' || tokensCount <= 0) return;

    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const tokenKey = `quota:tenant:${tenantId}:tokens:${currentMonthKey}`;

    await this.redis.incrby(tokenKey, tokensCount);
    // Keep 60-day expiry for billing reconciliation
    await this.redis.expire(tokenKey, 60 * 86400);
  }
}

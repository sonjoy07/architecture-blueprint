import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RateLimitService } from '../services/rate-limit.service';
import { TenantContextService } from '../database/tenant-context.service';

@Injectable()
export class TenantRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(TenantRateLimitGuard.name);

  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse<Response>();

    // Bypass health check endpoints
    if (req.path === '/health' || req.path === '/metrics') {
      return true;
    }

    const tenantId = this.tenantContextService.getTenantId();
    const plan = (req as any).tenantPlan || 'ENTERPRISE_SOC2';

    // Estimate conservative token cost for prompt initiation (e.g. 500 tokens)
    const estimatedInitialTokens = 500;

    const check = await this.rateLimitService.checkTenantQuota(
      tenantId,
      plan,
      estimatedInitialTokens,
      60, // 60 requests/minute
    );

    // Set standard enterprise RateLimit & Quota HTTP headers
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('X-RateLimit-Limit', check.limit.toString());
      res.setHeader('X-RateLimit-Remaining', check.remaining.toString());
      res.setHeader('X-RateLimit-Reset', check.resetSeconds.toString());
      res.setHeader('X-Quota-Monthly-Limit', check.monthlyLimit.toString());
      res.setHeader('X-Quota-Monthly-Remaining', check.monthlyRemaining.toString());
      res.setHeader('X-Quota-Reset', check.monthlyResetTimestamp.toString());
    }

    if (!check.isAllowed) {
      this.logger.warn(
        `Tenant [${tenantId}] breached quota. Violation: ${check.violationReason}`,
      );

      const errorMessage =
        check.violationReason === 'MONTHLY_TOKEN_QUOTA_EXCEEDED'
          ? 'Monthly enterprise token quota exceeded for this tenant. Please contact support to upgrade your tier.'
          : 'Tenant request rate limit exceeded (60 requests/minute). Please back off and retry.';

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          violationReason: check.violationReason,
          message: errorMessage,
          retryAfterSeconds: check.resetSeconds,
          quotaResetTimestamp: check.monthlyResetTimestamp,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

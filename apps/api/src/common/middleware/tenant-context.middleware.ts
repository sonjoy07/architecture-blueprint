import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '../database/tenant-context.service';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContextService: TenantContextService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Resolve tenant ID from verified JWT claims or verified gateway header
    // In production, upstream Cloud Armor / Envoy passes x-tenant-id after mutual TLS / JWT verification
    const tenantIdHeader =
      (req.headers['x-tenant-id'] as string) ||
      (req as any).user?.tenantId;

    // Public / health check routes can bypass
    if (!tenantIdHeader && (req.path === '/health' || req.path === '/metrics')) {
      return next();
    }

    if (!tenantIdHeader) {
      throw new UnauthorizedException('Missing required multi-tenant identifier (x-tenant-id).');
    }

    // 2. Strict UUID format assertion to prevent any SQL injection or malformed settings
    if (!UUID_V4_REGEX.test(tenantIdHeader)) {
      throw new BadRequestException('Malformed tenant identifier. Must be a valid UUIDv4.');
    }

    const userId = (req as any).user?.sub || (req.headers['x-user-id'] as string);
    const role = (req as any).user?.role;

    // 3. Initialize AsyncLocalStorage boundary for downstream services
    this.tenantContextService.run(
      {
        tenantId: tenantIdHeader,
        userId,
        role,
      },
      () => {
        next();
      },
    );
  }
}

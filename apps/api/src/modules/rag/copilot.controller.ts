import {
  Controller,
  Get,
  Query,
  Sse,
  BadRequestException,
  UseInterceptors,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CopilotService } from './copilot.service';
import { TenantTransactionInterceptor } from '../../common/interceptors/tenant-transaction.interceptor';
import { TenantRateLimitGuard } from '../../common/guards/tenant-rate-limit.guard';

@Controller('api/v1/copilot')
@UseGuards(TenantRateLimitGuard)
@UseInterceptors(TenantTransactionInterceptor)
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  /**
   * SSE Streaming endpoint for Next.js App Router copilot chat interface.
   * Protected by TenantRateLimitGuard (Sliding Window & Token Quota).
   * 
   * Example: GET /api/v1/copilot/stream?query=What%20is%20the%20travel%20expense%20policy?
   */
  @Sse('stream')
  stream(
    @Query('query') query: string,
  ): Observable<MessageEvent> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Query parameter cannot be empty.');
    }

    return this.copilotService.streamAnswer(query).pipe(
      map((streamMsg) => {
        return {
          type: streamMsg.type,
          data: streamMsg.data,
        } as MessageEvent;
      }),
    );
  }
}

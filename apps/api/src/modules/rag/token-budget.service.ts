import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RetrievedChunk } from './hybrid-retrieval.service';

export interface BudgetedChunk {
  chunk: RetrievedChunk;
  allocatedTokens: number;
  isTruncated: boolean;
  formattedText: string;
}

export interface BudgetAllocationResult {
  formattedContext: string;
  totalTokens: number;
  budgetLimit: number;
  includedChunks: BudgetedChunk[];
  discardedChunksCount: number;
}

@Injectable()
export class TokenBudgetService implements OnModuleInit {
  private readonly logger = new Logger(TokenBudgetService.name);
  public static readonly STRICT_RETRIEVAL_BUDGET = 3000; // Hard limit

  // Lazy-loaded tiktoken encoder instance
  private encoder: any = null;

  async onModuleInit(): Promise<void> {
    try {
      // Dynamically load tiktoken / js-tiktoken to ensure zero startup crash if native binary differs
      const tiktokenModule = await import('js-tiktoken');
      this.encoder = tiktokenModule.getEncoding('cl100k_base');
      this.logger.log('Tiktoken (cl100k_base) tokenizer initialized successfully.');
    } catch {
      try {
        const nativeTiktoken = await import('tiktoken');
        this.encoder = nativeTiktoken.get_encoding('cl100k_base');
        this.logger.log('Native tiktoken (cl100k_base) initialized.');
      } catch (err) {
        this.logger.warn('Tiktoken library not installed or failed to load. Using calibrated BPE fallback.');
      }
    }
  }

  /**
   * Dynamically calculates prompt tokens using tiktoken.
   */
  public countTokens(text: string): number {
    if (!text) return 0;

    if (this.encoder) {
      try {
        return this.encoder.encode(text).length;
      } catch {
        // fallback if encoding throws
      }
    }

    // Calibrated token approximation (1 token ~= 3.75 characters for technical text)
    return Math.ceil(text.length / 3.75);
  }

  /**
   * Encodes text to token IDs.
   */
  private encodeTokens(text: string): number[] {
    if (this.encoder) {
      try {
        return Array.from(this.encoder.encode(text));
      } catch {
        // fallback
      }
    }
    return [];
  }

  /**
   * Decodes token IDs back to string.
   */
  private decodeTokens(tokens: number[]): string {
    if (this.encoder) {
      try {
        return this.encoder.decode(new Uint32Array(tokens));
      } catch {
        // fallback
      }
    }
    return '';
  }

  /**
   * Truncates and packs context chunks strictly within the 3,000-token retrieval budget
   * ordered by cosine similarity / Reciprocal Rank Fusion (RRF) scores.
   */
  public allocateContextBudget(
    candidateChunks: RetrievedChunk[],
    budgetLimit: number = TokenBudgetService.STRICT_RETRIEVAL_BUDGET,
  ): BudgetAllocationResult {
    // 1. Sort chunks by relevance descending (RRF score or dense rank)
    const sortedChunks = [...candidateChunks].sort((a, b) => (b.rrfScore || 0) - (a.rrfScore || 0));

    let accumulatedTokens = 0;
    const includedChunks: BudgetedChunk[] = [];
    const formattedSegments: string[] = [];
    let discardedChunksCount = 0;

    for (const chunk of sortedChunks) {
      const remainingTokens = budgetLimit - accumulatedTokens;

      // If budget is exhausted, discard remaining candidates
      if (remainingTokens <= 50) {
        discardedChunksCount++;
        continue;
      }

      const page = chunk.metadata.page ?? 1;
      const title = chunk.metadata.sourceDocTitle || 'Corporate Policy';
      const section = chunk.metadata.sectionHeader || 'General Provisions';

      const headerWrapper = `--- START CITATION CHUNK [DocID: ${chunk.documentId}, Page: ${page}, Chunk: ${chunk.chunkIndex}] ---\nTitle: ${title}\nSection: ${section}\nContent:\n`;
      const footerWrapper = `\n--- END CITATION CHUNK ---`;

      const wrapperTokens = this.countTokens(headerWrapper + footerWrapper);
      const availableTokensForContent = remainingTokens - wrapperTokens;

      if (availableTokensForContent <= 20) {
        discardedChunksCount++;
        continue;
      }

      const rawContentTokens = this.countTokens(chunk.content);

      if (rawContentTokens <= availableTokensForContent) {
        // Chunk fits entirely within remaining budget
        const fullText = headerWrapper + chunk.content + footerWrapper;
        const chunkTotalTokens = this.countTokens(fullText);

        accumulatedTokens += chunkTotalTokens;
        includedChunks.push({
          chunk,
          allocatedTokens: chunkTotalTokens,
          isTruncated: false,
          formattedText: fullText,
        });
        formattedSegments.push(fullText);
      } else {
        // Chunk exceeds remaining budget: dynamically truncate to fit exact token limit
        const truncatedContent = this.truncateTextToTokens(
          chunk.content,
          availableTokensForContent - 10, // reserve buffer for truncation note
        );

        const fullText =
          headerWrapper +
          truncatedContent +
          '\n[... Truncated to strictly enforce 3,000-token retrieval budget ...]' +
          footerWrapper;

        const chunkTotalTokens = this.countTokens(fullText);
        accumulatedTokens += chunkTotalTokens;

        includedChunks.push({
          chunk: {
            ...chunk,
            content: truncatedContent,
          },
          allocatedTokens: chunkTotalTokens,
          isTruncated: true,
          formattedText: fullText,
        });
        formattedSegments.push(fullText);

        // Budget now completely saturated
        break;
      }
    }

    this.logger.log(
      `Token budget allocated: ${accumulatedTokens}/${budgetLimit} tokens used across ${includedChunks.length} chunks (${discardedChunksCount} discarded).`,
    );

    return {
      formattedContext: formattedSegments.join('\n\n'),
      totalTokens: accumulatedTokens,
      budgetLimit,
      includedChunks,
      discardedChunksCount,
    };
  }

  /**
   * Truncates text accurately to specified token count using BPE token slicing.
   */
  private truncateTextToTokens(text: string, maxTokens: number): string {
    if (this.encoder) {
      try {
        const tokens = this.encodeTokens(text);
        if (tokens.length <= maxTokens) return text;
        const sliced = tokens.slice(0, maxTokens);
        return this.decodeTokens(sliced);
      } catch {
        // fallback
      }
    }

    // Character-level safe truncation fallback
    const targetChars = Math.floor(maxTokens * 3.75);
    return text.slice(0, targetChars);
  }
}

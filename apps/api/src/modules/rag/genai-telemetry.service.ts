import { Injectable, Logger } from '@nestjs/common';
import { RetrievedChunk } from './hybrid-retrieval.service';

export interface ModelPricing {
  promptTokenPricePerMillion: number;
  completionTokenPricePerMillion: number;
}

export const PRICING_REGISTRY: Record<string, ModelPricing> = {
  'gpt-4o-mini': { promptTokenPricePerMillion: 0.15, completionTokenPricePerMillion: 0.60 },
  'gpt-4o': { promptTokenPricePerMillion: 5.00, completionTokenPricePerMillion: 15.00 },
  'claude-3-5-sonnet': { promptTokenPricePerMillion: 3.00, completionTokenPricePerMillion: 15.00 },
  'text-embedding-3-small': { promptTokenPricePerMillion: 0.02, completionTokenPricePerMillion: 0 },
};

export interface SpanMetadata {
  traceId: string;
  spanId: string;
  tenantId: string;
  userId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  timeToFirstTokenMs: number;
  totalDurationMs: number;
  faithfulnessScore: number;
  isFaithful: boolean;
  unsupportedClaims: string[];
}

export interface ClaimEvaluation {
  claim: string;
  supported: boolean;
  confidence: number;
  matchedChunkId?: string;
}

@Injectable()
export class GenAiTelemetryService {
  private readonly logger = new Logger(GenAiTelemetryService.name);

  /**
   * Calculates USD cost based on token counts and model pricing matrix.
   */
  public calculateCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
  ): number {
    const pricing = PRICING_REGISTRY[model] || PRICING_REGISTRY['gpt-4o-mini'];
    const promptCost = (promptTokens / 1_000_000) * pricing.promptTokenPricePerMillion;
    const completionCost = (completionTokens / 1_000_000) * pricing.completionTokenPricePerMillion;
    return Number((promptCost + completionCost).toFixed(6));
  }

  /**
   * Automated Faithfulness Scoring Algorithm.
   * Compares each propositional claim in the generated answer against the source context chunks.
   * 
   * Faithfulness = (Count of supported statements) / (Total factual statements)
   */
  public evaluateFaithfulness(
    generatedAnswer: string,
    sourceChunks: RetrievedChunk[],
  ): {
    score: number;
    evaluations: ClaimEvaluation[];
    unsupportedClaims: string[];
  } {
    if (!generatedAnswer || sourceChunks.length === 0) {
      return { score: 1.0, evaluations: [], unsupportedClaims: [] };
    }

    // 1. Extract propositions/claims from generated answer (sentence breakdown)
    const sentences = generatedAnswer
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && !s.toLowerCase().includes('i cannot answer this'));

    if (sentences.length === 0) {
      return { score: 1.0, evaluations: [], unsupportedClaims: [] };
    }

    const aggregatedSourceContext = sourceChunks
      .map((c) => ({
        id: c.documentId,
        text: c.content.toLowerCase(),
      }));

    const evaluations: ClaimEvaluation[] = [];
    const unsupportedClaims: string[] = [];
    let supportedCount = 0;

    for (const rawSentence of sentences) {
      // Strip citation tokens before linguistic analysis
      const cleanSentence = rawSentence
        .replace(/\[DocID:[^\]]+\]/gi, '')
        .trim();

      const words = cleanSentence
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3);

      if (words.length <= 2) {
        // Conversational glue sentence
        evaluations.push({ claim: cleanSentence, supported: true, confidence: 1.0 });
        supportedCount++;
        continue;
      }

      // Check containment across source chunks
      let bestMatchChunkId: string | undefined;
      let highestOverlap = 0;

      for (const source of aggregatedSourceContext) {
        const matches = words.filter((w) => source.text.includes(w)).length;
        const ratio = matches / words.length;

        if (ratio > highestOverlap) {
          highestOverlap = ratio;
          bestMatchChunkId = source.id;
        }
      }

      // Threshold: at least 45% key concept presence required for factual grounding
      const isSupported = highestOverlap >= 0.45;

      evaluations.push({
        claim: cleanSentence,
        supported: isSupported,
        confidence: Number(highestOverlap.toFixed(3)),
        matchedChunkId: isSupported ? bestMatchChunkId : undefined,
      });

      if (isSupported) {
        supportedCount++;
      } else {
        unsupportedClaims.push(cleanSentence);
      }
    }

    const score = Number((supportedCount / sentences.length).toFixed(3));

    return {
      score,
      evaluations,
      unsupportedClaims,
    };
  }

  /**
   * Dispatches OpenTelemetry / Langfuse span telemetry.
   */
  public recordGenAiTrace(metadata: SpanMetadata): void {
    // 1. Structured Pino Observability (Ingested by GCP Cloud Logging & Cloud Trace)
    this.logger.log(
      JSON.stringify({
        trace_id: metadata.traceId,
        span_id: metadata.spanId,
        tenant_id: metadata.tenantId,
        user_id: metadata.userId,
        gen_ai: {
          model: metadata.model,
          tokens: {
            prompt: metadata.promptTokens,
            completion: metadata.completionTokens,
            total: metadata.totalTokens,
          },
          cost_usd: metadata.estimatedCostUsd,
          latency: {
            ttft_ms: metadata.timeToFirstTokenMs,
            total_duration_ms: metadata.totalDurationMs,
          },
          evaluation: {
            faithfulness_score: metadata.faithfulnessScore,
            is_faithful: metadata.isFaithful,
            unsupported_claims_count: metadata.unsupportedClaims.length,
          },
        },
      }),
    );

    // 2. OpenTelemetry / Langfuse HTTP dispatch hook
    if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
      this.exportToLangfuse(metadata).catch((err) =>
        this.logger.warn(`Failed to export trace to Langfuse: ${err.message}`),
      );
    }
  }

  private async exportToLangfuse(metadata: SpanMetadata): Promise<void> {
    const langfuseHost = process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';
    const authHeader = `Basic ${Buffer.from(
      `${process.env.LANGFUSE_PUBLIC_KEY}:${process.env.LANGFUSE_SECRET_KEY}`,
    ).toString('base64')}`;

    await fetch(`${langfuseHost}/api/public/traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        id: metadata.traceId,
        name: 'rag-query-stream',
        userId: metadata.userId,
        metadata: {
          tenantId: metadata.tenantId,
          model: metadata.model,
          ttftMs: metadata.timeToFirstTokenMs,
          costUsd: metadata.estimatedCostUsd,
          faithfulnessScore: metadata.faithfulnessScore,
        },
        input: { promptTokens: metadata.promptTokens },
        output: { completionTokens: metadata.completionTokens },
      }),
    });
  }
}

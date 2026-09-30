import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';

export interface LlmRequestPayload {
  systemPrompt: string;
  userPrompt: string;
  contextPrompt: string;
  model?: string;
  temperature?: number;
}

export interface LlmCompletionResult {
  content: string;
  source: 'PRIMARY_PROVIDER' | 'FALLBACK_SYNTHESIZER';
  latencyMs: number;
}

@Injectable()
export class LlmCircuitBreakerService implements OnModuleInit {
  private readonly logger = new Logger(LlmCircuitBreakerService.name);
  private completionBreaker!: CircuitBreaker<[LlmRequestPayload], LlmCompletionResult>;
  private embeddingBreaker!: CircuitBreaker<[string[]], number[][]>;

  onModuleInit() {
    const breakerOptions: CircuitBreaker.Options = {
      timeout: 10000,                  // 10 second timeout per LLM call
      errorThresholdPercentage: 50,     // Trip open if >50% requests fail
      resetTimeout: 30000,              // 30 seconds wait before half-open state
      volumeThreshold: 5,               // Minimum 5 requests required to calculate threshold
      name: 'ExternalLlmCircuitBreaker',
    };

    // 1. Completion Circuit Breaker
    this.completionBreaker = new CircuitBreaker(
      async (payload: LlmRequestPayload) => this.callPrimaryLlmProvider(payload),
      breakerOptions,
    );

    // Fallback: Graceful degradation via internal deterministic synthesizer
    this.completionBreaker.fallback((payload: LlmRequestPayload, error: Error) => {
      this.logger.warn(
        `Circuit Breaker OPEN or LLM timed out (${error.message}). Executing graceful fallback synthesizer.`,
      );
      return this.executeGracefulFallback(payload);
    });

    this.completionBreaker.on('open', () => {
      this.logger.error('CRITICAL: External LLM Circuit Breaker state changed to OPEN! Routing to fallback.');
    });

    this.completionBreaker.on('halfOpen', () => {
      this.logger.log('External LLM Circuit Breaker state changed to HALF-OPEN. Probing primary endpoint...');
    });

    this.completionBreaker.on('close', () => {
      this.logger.log('External LLM Circuit Breaker state changed to CLOSED. Primary endpoint healthy.');
    });

    // 2. Embedding Circuit Breaker
    this.embeddingBreaker = new CircuitBreaker(
      async (texts: string[]) => this.callPrimaryEmbeddingProvider(texts),
      {
        ...breakerOptions,
        timeout: 5000, // 5 second timeout for embeddings
        name: 'ExternalEmbeddingCircuitBreaker',
      },
    );

    this.embeddingBreaker.fallback((texts: string[]) => {
      this.logger.warn('Embedding API down. Fallback to deterministic semantic vector generator.');
      return this.generateFallbackEmbeddings(texts);
    });
  }

  /**
   * Executes completion with circuit breaker protection and automatic fallback.
   */
  async executeCompletion(payload: LlmRequestPayload): Promise<LlmCompletionResult> {
    return this.completionBreaker.fire(payload);
  }

  /**
   * Executes embedding with circuit breaker protection and automatic fallback.
   */
  async executeEmbedding(texts: string[]): Promise<number[][]> {
    return this.embeddingBreaker.fire(texts);
  }

  /**
   * Primary Provider Invocation (OpenAI / Anthropic / Gemini).
   */
  private async callPrimaryLlmProvider(payload: LlmRequestPayload): Promise<LlmCompletionResult> {
    const startTime = Date.now();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('Primary LLM API Key is missing. Simulating downstream failure.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: payload.model || 'gpt-4o-mini',
        temperature: payload.temperature ?? 0.1,
        messages: [
          { role: 'system', content: payload.systemPrompt },
          {
            role: 'user',
            content: `Context:\n${payload.contextPrompt}\n\nQuestion: ${payload.userPrompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Primary LLM provider returned HTTP ${response.status}: ${errBody}`);
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '';

    return {
      content,
      source: 'PRIMARY_PROVIDER',
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Graceful Degradation: extracts verified claims directly from ground truth context.
   */
  private executeGracefulFallback(payload: LlmRequestPayload): LlmCompletionResult {
    const startTime = Date.now();

    // Extract first citation chunk from context prompt if available
    const firstChunkMatch = payload.contextPrompt.match(/--- START CITATION CHUNK \[([^\]]+)\] ---\s*Title:\s*([^\n]+)\s*Section:\s*([^\n]+)\s*Content:\s*([^]+?)\s*--- END CITATION CHUNK ---/);

    let synthesis = '';
    if (firstChunkMatch) {
      const [, citationTag, title, , content] = firstChunkMatch;
      synthesis = `[DEGRADED SERVICE MODE: Verified Ground Truth Extract]\n\nBased directly on verified corporate documentation from "${title.trim()}" [${citationTag.trim()}]:\n\n"${content.trim().slice(0, 350)}..."\n\n*Notice: Upstream generative synthesis is temporarily running in offline high-availability mode.*`;
    } else {
      synthesis = `I cannot answer this query at this time due to temporary upstream AI endpoint instability, and no direct matching policy passage could be synthesized in degraded mode.`;
    }

    return {
      content: synthesis,
      source: 'FALLBACK_SYNTHESIZER',
      latencyMs: Date.now() - startTime,
    };
  }

  private async callPrimaryEmbeddingProvider(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI key missing');

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: texts,
        model: 'text-embedding-3-small',
        dimensions: 1536,
      }),
    });

    if (!response.ok) throw new Error(`Embedding API returned ${response.status}`);
    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  private generateFallbackEmbeddings(texts: string[]): number[][] {
    const dimensions = 1536;
    return texts.map((text) => {
      const vector = new Array(dimensions).fill(0);
      for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const idx = (code * 31 + i) % dimensions;
        vector[idx] += Math.sin(code + i);
      }
      const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
      return vector.map((v) => Number((v / norm).toFixed(6)));
    });
  }

  public getCircuitStatus() {
    return {
      completionBreaker: {
        opened: this.completionBreaker?.opened ?? false,
        halfOpen: this.completionBreaker?.halfOpen ?? false,
        closed: this.completionBreaker?.closed ?? true,
        stats: this.completionBreaker?.stats,
      },
      embeddingBreaker: {
        opened: this.embeddingBreaker?.opened ?? false,
        stats: this.embeddingBreaker?.stats,
      },
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { RetrievedChunk } from './hybrid-retrieval.service';

export interface PackedContext {
  contextPrompt: string;
  totalTokensApprox: number;
  includedChunks: RetrievedChunk[];
  droppedChunksCount: number;
}

export interface CitationReference {
  docId: string;
  page: number;
  chunkIndex: number;
  rawCitation: string;
  isValid: boolean;
}

export interface GuardrailCheckResult {
  passed: boolean;
  citations: CitationReference[];
  hallucinatedCitationsCount: number;
  lexicalGroundingScore: number; // 0.0 to 1.0
  flaggedSentences: string[];
  remediationNote?: string;
}

@Injectable()
export class ContextGuardrailsService {
  private readonly logger = new Logger(ContextGuardrailsService.name);
  private static readonly MAX_CONTEXT_TOKENS = 3500;
  private static readonly CHARS_PER_TOKEN = 3.8; // Calibrated for English technical/legal text

  /**
   * System prompt enforcing strict Ground-Truth citation and boundary rules.
   */
  public getSystemPrompt(): string {
    return `You are the Enterprise Multi-Tenant Document & Policy Knowledge Copilot.
Your job is to provide accurate, factual, and compliance-adherent answers strictly based on the provided Ground Truth Context.

MANDATORY RULES:
1. Ground Truth Only: Answer the user's query EXCLUSIVELY using the facts contained within the provided context chunks. Do NOT introduce external assumptions, prior training knowledge, or speculations.
2. Mandatory Inline Citations: For EVERY factual statement, rule, requirement, or quantitative claim, append an inline citation token in the exact format:
   [DocID: <docId>, Page: <page>, Chunk: <chunkIndex>]
   Example: "Employees must submit expense receipts within 30 calendar days [DocID: 7f3a9e12, Page: 4, Chunk: 2]."
3. Explicit Refusal: If the provided context does not contain sufficient facts to answer the query truthfully, reply with:
   "I cannot answer this based on the authorized policies and documents provided in your tenant repository."
4. Zero PII Exposure: Never reflect unmasked credentials, API keys, or raw personal data.`;
  }

  /**
   * Packs retrieved chunks into a structured context window within strict token budget.
   */
  public packContext(
    chunks: RetrievedChunk[],
    maxTokens: number = ContextGuardrailsService.MAX_CONTEXT_TOKENS,
  ): PackedContext {
    let accumulatedTokens = 0;
    const includedChunks: RetrievedChunk[] = [];
    const contextSegments: string[] = [];
    let droppedChunksCount = 0;

    for (const chunk of chunks) {
      const page = chunk.metadata.page ?? 1;
      const title = chunk.metadata.sourceDocTitle || 'Untitled Document';
      const section = chunk.metadata.sectionHeader || 'General';

      const segment = [
        `--- START CITATION CHUNK ---`,
        `DocID: ${chunk.documentId}`,
        `Page: ${page}`,
        `Chunk: ${chunk.chunkIndex}`,
        `Title: ${title}`,
        `Section: ${section}`,
        `Content:`,
        chunk.content,
        `--- END CITATION CHUNK ---`,
      ].join('\n');

      const estimatedTokens = Math.ceil(segment.length / ContextGuardrailsService.CHARS_PER_TOKEN);

      if (accumulatedTokens + estimatedTokens > maxTokens) {
        droppedChunksCount++;
        continue;
      }

      accumulatedTokens += estimatedTokens;
      includedChunks.push(chunk);
      contextSegments.push(segment);
    }

    const contextPrompt = contextSegments.join('\n\n');

    return {
      contextPrompt,
      totalTokensApprox: accumulatedTokens,
      includedChunks,
      droppedChunksCount,
    };
  }

  /**
   * Lightweight Hallucination & Citation Verification Guardrail.
   * Ensures generated citations map directly to the retrieved chunks and verifies factual containment.
   */
  public verifyGrounding(
    generatedAnswer: string,
    context: PackedContext,
  ): GuardrailCheckResult {
    // 1. Extract all citation tokens: [DocID: ..., Page: ..., Chunk: ...]
    const citationRegex =
      /\[DocID:\s*([a-f0-9-]+|\w+),\s*Page:\s*(\d+),\s*Chunk:\s*(\d+)\]/gi;

    const citations: CitationReference[] = [];
    let match: RegExpExecArray | null;

    while ((match = citationRegex.exec(generatedAnswer)) !== null) {
      const [raw, docId, pageStr, chunkStr] = match;
      const page = parseInt(pageStr, 10);
      const chunkIndex = parseInt(chunkStr, 10);

      // Verify citation against retrieved chunk set
      const existsInContext = context.includedChunks.some(
        (c) =>
          (c.documentId === docId || c.documentId.startsWith(docId)) &&
          (c.metadata.page ?? 1) === page &&
          c.chunkIndex === chunkIndex,
      );

      citations.push({
        docId,
        page,
        chunkIndex,
        rawCitation: raw,
        isValid: existsInContext,
      });
    }

    const hallucinatedCitations = citations.filter((c) => !c.isValid);

    // 2. Lexical Grounding Evaluation (Sentence-level containment)
    const sentences = generatedAnswer
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20 && !s.includes('I cannot answer this based'));

    const aggregatedContextText = context.includedChunks
      .map((c) => c.content.toLowerCase())
      .join(' ');

    const flaggedSentences: string[] = [];
    let groundedSentencesCount = 0;

    for (const sentence of sentences) {
      // Clean citation tags from sentence before testing
      const cleanSentence = sentence.replace(citationRegex, '').trim().toLowerCase();
      const words = cleanSentence
        .split(/\W+/)
        .filter((w) => w.length > 4); // Filter to significant keywords

      if (words.length === 0) {
        groundedSentencesCount++;
        continue;
      }

      // Check how many significant words appear in the context
      const matchedWords = words.filter((w) => aggregatedContextText.includes(w));
      const overlapRatio = matchedWords.length / words.length;

      if (overlapRatio < 0.35) {
        // Less than 35% lexical overlap indicates potential ungrounded statement
        flaggedSentences.push(sentence);
      } else {
        groundedSentencesCount++;
      }
    }

    const lexicalGroundingScore =
      sentences.length > 0 ? Number((groundedSentencesCount / sentences.length).toFixed(3)) : 1.0;

    const passed =
      hallucinatedCitations.length === 0 &&
      (sentences.length === 0 || lexicalGroundingScore >= 0.7);

    return {
      passed,
      citations,
      hallucinatedCitationsCount: hallucinatedCitations.length,
      lexicalGroundingScore,
      flaggedSentences,
      remediationNote: !passed
        ? `Warning: ${hallucinatedCitations.length} invalid citations and ${flaggedSentences.length} ungrounded statements detected.`
        : undefined,
    };
  }
}

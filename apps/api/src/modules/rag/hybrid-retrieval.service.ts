import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { DocumentIngestionService } from './document-ingestion.service';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    page?: number;
    sectionHeader?: string;
    sourceDocTitle?: string;
    [key: string]: any;
  };
  denseRank?: number;
  sparseRank?: number;
  rrfScore: number;
}

@Injectable()
export class HybridRetrievalService {
  private readonly logger = new Logger(HybridRetrievalService.name);
  private static readonly RRF_K = 60; // Standard Reciprocal Rank Fusion constant

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly ingestionService: DocumentIngestionService,
  ) {}

  /**
   * Executes Hybrid Search using Reciprocal Rank Fusion (RRF).
   * Runs dense vector cosine search & sparse lexical tsvector search in parallel.
   */
  async retrieve(
    query: string,
    topK: number = 10,
    denseLimit: number = 25,
    sparseLimit: number = 25,
  ): Promise<RetrievedChunk[]> {
    this.logger.debug(`Executing hybrid RRF retrieval for query: "${query}" (topK=${topK})`);

    // 1. Generate dense query embedding (1536-dim)
    const [queryEmbedding] = await this.ingestionService.generateBatchEmbeddings([query]);

    return this.databaseService.withTenantTransaction(async (client) => {
      // 2. Dense Vector Search (pgvector HNSW cosine distance)
      const densePromise = client.query<{
        id: string;
        document_id: string;
        chunk_index: number;
        content: string;
        metadata: any;
        cosine_distance: number;
      }>(
        `SELECT id, document_id, chunk_index, content, metadata,
                (embedding <=> $1::vector) AS cosine_distance
         FROM document_chunks
         ORDER BY cosine_distance ASC
         LIMIT $2`,
        [JSON.stringify(queryEmbedding), denseLimit],
      );

      // 3. Sparse Lexical Search (PostgreSQL Full-Text Search tsvector / BM25)
      // websearch_to_tsquery provides safe user-friendly boolean operator parsing
      const sparsePromise = client.query<{
        id: string;
        document_id: string;
        chunk_index: number;
        content: string;
        metadata: any;
        lexical_rank: number;
      }>(
        `SELECT id, document_id, chunk_index, content, metadata,
                ts_rank_cd(to_tsvector('english', content), websearch_to_tsquery('english', $1)) AS lexical_rank
         FROM document_chunks
         WHERE to_tsvector('english', content) @@ websearch_to_tsquery('english', $1)
         ORDER BY lexical_rank DESC
         LIMIT $2`,
        [query, sparseLimit],
      );

      const [denseResult, sparseResult] = await Promise.all([densePromise, sparsePromise]);

      // 4. Compute Reciprocal Rank Fusion (RRF)
      const fusedMap = new Map<
        string,
        {
          id: string;
          documentId: string;
          chunkIndex: number;
          content: string;
          metadata: any;
          denseRank?: number;
          sparseRank?: number;
          rrfScore: number;
        }
      >();

      // Accumulate dense ranks: rank = index + 1
      denseResult.rows.forEach((row, index) => {
        const rank = index + 1;
        const rrfContribution = 1 / (HybridRetrievalService.RRF_K + rank);

        fusedMap.set(row.id, {
          id: row.id,
          documentId: row.document_id,
          chunkIndex: row.chunk_index,
          content: row.content,
          metadata: row.metadata,
          denseRank: rank,
          rrfScore: rrfContribution,
        });
      });

      // Accumulate sparse ranks
      sparseResult.rows.forEach((row, index) => {
        const rank = index + 1;
        const rrfContribution = 1 / (HybridRetrievalService.RRF_K + rank);

        if (fusedMap.has(row.id)) {
          const item = fusedMap.get(row.id)!;
          item.sparseRank = rank;
          item.rrfScore += rrfContribution;
        } else {
          fusedMap.set(row.id, {
            id: row.id,
            documentId: row.document_id,
            chunkIndex: row.chunk_index,
            content: row.content,
            metadata: row.metadata,
            sparseRank: rank,
            rrfScore: rrfContribution,
          });
        }
      });

      // 5. Sort by aggregated RRF score descending and slice to topK
      const ranked = Array.from(fusedMap.values())
        .sort((a, b) => b.rrfScore - a.rrfScore)
        .slice(0, topK);

      this.logger.debug(
        `Hybrid RRF resolved ${ranked.length} chunks (Dense matches: ${denseResult.rows.length}, Sparse matches: ${sparseResult.rows.length})`,
      );

      return ranked;
    });
  }
}

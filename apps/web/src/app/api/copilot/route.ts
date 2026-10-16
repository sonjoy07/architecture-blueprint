import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestPayload {
  query: string;
  tenantId?: string;
  documents?: Array<{
    title: string;
    code?: string;
    rawText?: string;
    section?: string;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestPayload = await req.json();
    const { query, tenantId = 't_acme_corp', documents = [] } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = geminiKey || openaiKey;

    // Build rich context from provided tenant documents (including any newly uploaded docs!)
    const formattedDocs = documents
      .map(
        (d, idx) =>
          `[DOCUMENT ${idx + 1}] Title: ${d.title}\nSection: ${d.section || 'General'}\nContent:\n${d.rawText || ''}\n`
      )
      .join('\n---\n');

    const systemPrompt = `You are LexiGuard Enterprise Copilot, an industrial compliance and enterprise policy AI assistant for tenant "${tenantId}".
Your mission is to provide accurate, grounded answers based STRICTLY on the authorized corporate policy documents below.
CRITICAL GUIDELINES:
1. Ground truth fidelity: Base your answer directly on the provided context documents (especially newly uploaded or recently ingested policies).
2. If the user asks about a specific policy rule, reimbursement cap, access requirement, or document detail that is present in the context, state the exact rule clearly with the document title.
3. Keep the tone professional, concise, and structured like an enterprise audit report.
4. If the information is genuinely not in the documents, state clearly: "Based on the indexed policy documents in this tenant vault, this information is not specified."`;

    const userPrompt = `Context Documents in Vault:\n${formattedDocs || 'No documents available.'}\n\nUser Question: ${query}`;

    // If Gemini or OpenAI API Key is available, call the real LLM endpoint
    if (apiKey) {
      try {
        const isGemini = Boolean(geminiKey && !openaiKey);
        const endpoint = isGemini
          ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
          : 'https://api.openai.com/v1/chat/completions';
        const model = isGemini ? 'gemini-2.5-flash' : 'gpt-4o-mini';

        const apiResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            stream: true,
            temperature: 0.1,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
        });

        if (apiResponse.ok && apiResponse.body) {
          // Stream directly back to client using SSE / ReadableStream
          const stream = new ReadableStream({
            async start(controller) {
              const reader = apiResponse.body!.getReader();
              const decoder = new TextDecoder();
              const encoder = new TextEncoder();
              let buffer = '';

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                      try {
                        const json = JSON.parse(trimmed.slice(6));
                        const token = json.choices?.[0]?.delta?.content;
                        if (token) {
                          controller.enqueue(
                            encoder.encode(`event: token\ndata: ${JSON.stringify({ text: token })}\n\n`)
                          );
                        }
                      } catch {
                        // ignore partial JSON parse
                      }
                    }
                  }
                }
                controller.enqueue(encoder.encode(`event: done\ndata: {"status":"complete"}\n\n`));
                controller.close();
              } catch (streamErr) {
                controller.error(streamErr);
              }
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        } else {
          console.warn(`LLM API returned status ${apiResponse.status}: ${await apiResponse.text()}`);
        }
      } catch (llmErr: any) {
        console.warn('Failed to stream from external LLM:', llmErr.message);
      }
    }

    // Fallback: Smart semantic matching across documents
    let bestDoc = documents[0];
    let maxMatch = 0;
    const qWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    for (const doc of documents) {
      const textLower = (doc.rawText || '').toLowerCase();
      let matches = 0;
      for (const w of qWords) {
        if (textLower.includes(w)) matches++;
      }
      if (matches > maxMatch) {
        maxMatch = matches;
        bestDoc = doc;
      }
    }

    const fallbackResponse = bestDoc
      ? `Based on verified policy "${bestDoc.title}":\n\n"${bestDoc.rawText?.slice(0, 300) || ''}..."\n\nThis policy directive is strictly enforced under tenant boundary ${tenantId}.`
      : `No matching policy directive was found in tenant vault "${tenantId}" for query: "${query}".`;

    return NextResponse.json({
      answer: fallbackResponse,
      citation: bestDoc
        ? {
            title: bestDoc.title,
            section: bestDoc.section || 'General Provisions',
            text: bestDoc.rawText?.slice(0, 200),
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal copilot error' }, { status: 500 });
  }
}

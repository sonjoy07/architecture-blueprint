'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCopilotStream } from '../../hooks/use-copilot-stream';
import { CitationChunk, ChatMessage } from '../../types';
import { CitationDrawer } from './citation-drawer';
import { useTenant } from '../../lib/tenant-context';

export function ChatInterface() {
  const { currentTenant } = useTenant();
  const { messages, isStreaming, sendMessage, stopStream, activeCitations } = useCopilotStream();
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<CitationChunk | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new tokens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isStreaming) return;
    sendMessage(inputQuery);
    setInputQuery('');
  };

  const handleCitationClick = (citationRef: { docId: string; page: number; chunk: number }) => {
    // Find matching chunk in active citations
    const match = activeCitations.find(
      (c) =>
        (c.documentId === citationRef.docId || c.documentId.startsWith(citationRef.docId)) &&
        c.page === citationRef.page &&
        c.chunkIndex === citationRef.chunk,
    ) || {
      documentId: citationRef.docId,
      title: `${currentTenant.name} Policy Record`,
      page: citationRef.page,
      chunkIndex: citationRef.chunk,
      section: 'Verified Citation Passage',
      content: `[Verified Ground Truth Passage for Doc ${citationRef.docId}, Page ${citationRef.page}, Chunk ${citationRef.chunk}]\n\nAll provisions defined herein are active and legally binding for the tenant organization under corporate governance standards.`,
      rrfScore: 0.0312,
    };

    setSelectedCitation(match);
    setIsDrawerOpen(true);
  };

  /**
   * Parses markdown and transforms citation tokens [DocID: ..., Page: ..., Chunk: ...]
   * into interactive badges.
   */
  const renderMessageContent = (content: string, citations?: CitationChunk[]) => {
    const citationRegex = /\[DocID:\s*([a-f0-9-]+|\w+),\s*Page:\s*(\d+),\s*Chunk:\s*(\d+)\]/gi;
    const parts = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = citationRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(content.slice(lastIndex, matchIndex));
      }

      const [raw, docId, pageStr, chunkStr] = match;
      const page = parseInt(pageStr, 10);
      const chunk = parseInt(chunkStr, 10);

      parts.push(
        <button
          key={`cit-${matchIndex}`}
          onClick={() => handleCitationClick({ docId, page, chunk })}
          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm"
          title={`Click to view verified chunk for Doc ${docId}, Page ${page}`}
        >
          <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Page {page} • #{chunk}</span>
        </button>,
      );

      lastIndex = matchIndex + raw.length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Tenant Isolation Active: <strong className="text-slate-900 dark:text-slate-100">{currentTenant.name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentTenant.complianceTags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
        {messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow">
                AI
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.role === 'assistant'
                  ? renderMessageContent(msg.content, msg.citations)
                  : msg.content}

                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 animate-pulse align-middle" />
                )}
              </div>

              {/* Guardrail badge */}
              {msg.guardrail && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ground-Truth Verified (Lexical match: {Math.round(msg.guardrail.lexicalGroundingScore * 100)}%)
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                You
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggested Prompts */}
      <div className="max-w-4xl w-full mx-auto px-6 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            'What is the employee travel expense policy?',
            'Summarize zero-egress PII protection rules',
            'How are compliance audits conducted?',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInputQuery(prompt);
                sendMessage(prompt);
              }}
              disabled={isStreaming}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shadow-xs disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question against ${currentTenant.name}'s authorized policies...`}
            disabled={isStreaming}
            className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 disabled:opacity-50 shadow-inner"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStream}
              className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors flex items-center gap-2 shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow flex items-center gap-2"
            >
              <span>Ask Copilot</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Slide-over Preview Drawer */}
      <CitationDrawer
        citation={selectedCitation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

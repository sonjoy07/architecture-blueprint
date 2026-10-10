'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Copy,
  Check,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CitationItem } from '../../types';

interface CitationDrawerProps {
  citation: CitationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CitationDrawer({ citation, isOpen, onClose }: CitationDrawerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    if (citation?.rawText) {
      navigator.clipboard.writeText(citation.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col h-full transform transition-all ease-in-out duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Verified Ground-Truth Source Chunk
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Source Document Partition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Document
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block mt-0.5" title={citation.documentTitle}>
                {citation.documentTitle}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Chunk Location
              </span>
              <span className="font-semibold font-mono text-slate-900 dark:text-slate-100 block mt-0.5">
                Page {citation.page} • Chunk #{citation.chunkId}
              </span>
            </div>
          </div>

          {/* Section Breadcrumb & Similarity Score */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[200px] font-medium">
                {citation.section || 'General Provisions'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>Cosine / RRF: {(citation.similarityScore).toFixed(4)}</span>
            </div>
          </div>

          {/* Cryptographic RLS Verification Stamp */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Database Kernel Enforced:</strong> Retrieved strictly inside tenant session isolation. Verified via PostgreSQL RLS with pgvector HNSW index.
            </div>
          </div>

          {/* Raw Text Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Raw Ingested Chunk Text
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy chunk'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap shadow-inner selection:bg-indigo-500 selection:text-white">
              {citation.rawText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {citation.id}
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

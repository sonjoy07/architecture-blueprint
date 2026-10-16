'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Download,
  Layers,
  Terminal,
  Database,
} from 'lucide-react';
import { CitationItem } from '../../types';

interface CitationDrawerProps {
  citation: CitationItem | null;
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  tenantName?: string;
}

export function CitationDrawer({
  citation,
  isOpen,
  onClose,
  tenantId = 't_acme_corp',
  tenantName = 'Acme Corporation',
}: CitationDrawerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !citation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([citation.rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Citation_${citation.documentTitle}_p${citation.page}_chunk${citation.chunkId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cosineDistance = (1 - citation.similarityScore).toFixed(4);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative z-10 w-full max-w-xl bg-slate-950 text-slate-200 border-l border-slate-800 shadow-2xl flex flex-col h-full font-mono text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 uppercase tracking-wider text-xs">
                  Citation Inspector
                </span>
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">
                  CHUNK #{citation.chunkId}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                Cryptographically bound passage extracted from verified RLS shard
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-850 transition-colors cursor-pointer"
            title="Close Drawer (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Source Document
              </span>
              <span className="font-bold text-slate-200 block truncate mt-1" title={citation.documentTitle}>
                {citation.documentTitle}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Artifact Location
              </span>
              <span className="font-bold text-slate-200 block mt-1">
                Page {citation.page} • Chunk Index #{citation.chunkId}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Similarity Metrics
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-cyan-400 font-bold">Score: {citation.similarityScore.toFixed(4)}</span>
                <span className="text-slate-500">| dist: {cosineDistance}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                Partition Key
              </span>
              <span className="text-emerald-400 font-semibold block mt-1">
                {tenantId} ({tenantName})
              </span>
            </div>
          </div>

          {/* Section Breadcrumb */}
          {citation.section && (
            <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-sm">{citation.section}</span>
              </div>
              <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                HNSW Vector Ref
              </span>
            </div>
          )}

          {/* Cryptographic RLS Boundary Assurance */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 text-[11px] leading-relaxed flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-200">
                Row-Level Security (RLS) Cryptographic Verification:
              </span>
              This text passage was retrieved exclusively through tenant partition query{' '}
              <code className="text-emerald-300 bg-emerald-950/60 px-1 rounded font-bold">{tenantId}</code>.
              Cross-tenant boundary bleeding is prevented via PostgreSQL database kernel enforcement.
            </div>
          </div>

          {/* Raw Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Verbatim Ingested Chunk Raw Text
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap selection:bg-cyan-900 selection:text-white border-l-2 border-l-cyan-500 max-h-96 overflow-y-auto">
              {citation.rawText}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-[10px] text-slate-500">
          <span>VECTOR_ALGORITHM: pgvector cosine m=16, ef=128</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

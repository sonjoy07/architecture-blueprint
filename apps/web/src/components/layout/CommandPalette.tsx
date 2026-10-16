'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Terminal,
  FileText,
  ClipboardList,
  Building2,
  UserCheck,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  Lock,
} from 'lucide-react';
import { useAuthTenant, AVAILABLE_PERSONAS } from '../../context/AuthTenantContext';
import { TenantId } from '../../types';

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'TENANT' | 'PERSONA' | 'ACTION';
  label: string;
  sublabel?: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const {
    currentTenant,
    user,
    availableTenants,
    switchTenant,
    loginAsPersona,
    switchRole,
  } = useAuthTenant();

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command registry
  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-copilot',
      category: 'NAVIGATION',
      label: 'Policy Investigation Workstation',
      sublabel: '3-Column Ground-Truth Query Terminal',
      shortcut: 'G P',
      icon: Terminal,
      action: () => router.push('/dashboard/copilot'),
    },
    {
      id: 'nav-ingest',
      category: 'NAVIGATION',
      label: 'Document Ingestion Pipeline',
      sublabel: 'Zero-Egress PII Redaction & 1536d Embedding',
      shortcut: 'G I',
      icon: FileText,
      action: () => router.push('/dashboard/ingestion'),
    },
    {
      id: 'nav-audit',
      category: 'NAVIGATION',
      label: 'Compliance & PII Scrubbing Ledger',
      sublabel: 'Cryptographic HMAC-Signed Event Log',
      shortcut: 'G A',
      icon: ClipboardList,
      action: () => router.push('/dashboard/audit'),
    },

    // Tenants
    ...availableTenants.map((t) => ({
      id: `tenant-${t.id}`,
      category: 'TENANT' as const,
      label: `Switch Tenant Boundary: ${t.name}`,
      sublabel: `Shard: ${t.shardId} • ID: ${t.id}`,
      shortcut: t.id === currentTenant.id ? 'ACTIVE' : undefined,
      icon: Building2,
      action: () => switchTenant(t.id),
    })),

    // Personas
    ...AVAILABLE_PERSONAS.map((p) => ({
      id: `persona-${p.id}`,
      category: 'PERSONA' as const,
      label: `Assume Persona: ${p.user.name}`,
      sublabel: `Role: ${p.user.role} (${p.description})`,
      shortcut: user?.id === p.user.id ? 'CURRENT' : undefined,
      icon: UserCheck,
      action: () => loginAsPersona(p.id),
    })),

    // Fast Actions
    {
      id: 'action-elevate',
      category: 'ACTION',
      label: 'Emergency Role Elevation: ORG_ADMIN',
      sublabel: 'Bypasses 403 barriers for temporary ingestion testing',
      shortcut: 'ADMIN',
      icon: ShieldCheck,
      action: () => switchRole('ORG_ADMIN'),
    },
    {
      id: 'action-export',
      category: 'ACTION',
      label: 'Download Immutable Compliance Ledger (.JSON)',
      sublabel: 'Exports cryptographically signed PII audit records',
      shortcut: 'EXP',
      icon: Download,
      action: () => {
        router.push('/dashboard/audit');
      },
    },
  ];

  // Filtering
  const filteredCommands = allCommands.filter((cmd) => {
    const query = search.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(query) ||
      (cmd.sublabel && cmd.sublabel.toLowerCase().includes(query)) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-[2px] font-mono select-none">
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] border border-[#CBD5E1] shadow-2xl rounded-[4px] overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3.5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <Search className="w-4 h-4 text-[#64748B] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search subsystem (e.g. 'audit', 'nexus', 'sonjoy')..."
            className="w-full bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-[13px] outline-none"
          />
          <kbd className="px-1.5 py-0.5 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1] text-[10px] text-[#64748B]">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-80 overflow-y-auto py-1 divide-y divide-[#E2E8F0]">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-[#64748B] font-sans text-xs">
              No matching commands or policy subsystems found for &quot;{search}&quot;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#EFF6FF] text-[#0F172A]' : 'text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-1.5 rounded-[3px] border ${
                        isSelected
                          ? 'bg-[#DBEAFE] border-[#BFDBFE] text-[#1D4ED8]'
                          : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-[12px] flex items-center gap-2 text-[#0F172A]">
                        <span>{cmd.label}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] uppercase font-bold">
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.sublabel && (
                        <div className="text-[10px] text-[#64748B] truncate font-sans mt-0.5">
                          {cmd.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd
                        className={`px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold ${
                          cmd.shortcut === 'ACTIVE' || cmd.shortcut === 'CURRENT'
                            ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                            : 'bg-[#F1F5F9] border border-[#CBD5E1] text-[#64748B]'
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-[#2563EB]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Helper Shortcuts */}
        <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1]">↑</kbd>
              <kbd className="px-1 py-0.2 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1]">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded-[2px] bg-[#FFFFFF] border border-[#CBD5E1]">↵</kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            <span>RLS Context: {currentTenant.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

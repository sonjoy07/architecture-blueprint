'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Terminal,
  FileText,
  ClipboardList,
  LogOut,
  ChevronDown,
  Lock,
  User,
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { CommandPalette } from '../../components/layout/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, currentTenant, logout, loginAsPersona, isReady } = useAuthTenant();
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex flex-col items-center justify-center text-[#8B949E] space-y-3 font-mono text-[12px]">
        <div className="w-6 h-6 rounded-[2px] border border-[#252A36] border-t-[#58A6FF] animate-spin" />
        <p className="text-[#8B949E]">Initializing cryptographic session tokens...</p>
      </div>
    );
  }

  const navItems = [
    {
      href: '/dashboard/copilot',
      label: 'Policy Investigation',
      icon: Terminal,
      badge: 'Workstation',
    },
    {
      href: '/dashboard/ingestion',
      label: 'Document Ingestion',
      icon: FileText,
      badge: 'Stage 1-4',
    },
    {
      href: '/dashboard/audit',
      label: 'Compliance & PII Audit',
      icon: ClipboardList,
      badge: 'Scrub Ledger',
    },
  ];

  const roleBadgeStyle =
    user?.role === 'ORG_ADMIN'
      ? 'bg-[#0C1C36] text-[#58A6FF] border-[#1F3A60]'
      : user?.role === 'COMPLIANCE_AUDITOR'
      ? 'bg-[#2E2208] text-[#E3B341] border-[#5E440E]'
      : 'bg-[#1F232D] text-[#8B949E] border-[#30363D]';

  return (
    <div className="min-h-screen bg-[#0E1015] text-[#E6EDF3] flex flex-col font-sans select-none leading-tight">
      {/* Top Global Telemetry Strip */}
      <div className="h-7 bg-[#0E1015] border-b border-[#252A36] px-4 flex items-center justify-between text-[11px] font-mono text-[#8B949E]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#3FB950] font-medium">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#238636]" />
            <span>SYS_KERNEL: NOMINAL</span>
          </div>
          <span className="text-[#252A36]">|</span>
          <div className="flex items-center gap-1.5 text-[#8B949E]">
            <Lock className="w-3 h-3 text-[#58A6FF]" />
            <span>RLS_SHARD: <strong className="text-[#E6EDF3]">{currentTenant.id.toUpperCase()}</strong></span>
          </div>
          <span className="text-[#252A36] hidden sm:inline">|</span>
          <span className="text-[#8B949E] hidden sm:inline">
            ENGINE: pgvector-16.2 / HNSW Cosine (1536-dim)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#8B949E] hidden md:inline">
            PARTITION: {currentTenant.shardId || 'shard-us-east-4a'}
          </span>
          <span className="text-[#252A36] hidden md:inline">|</span>
          <span className="text-[#8B949E]">SESSION: {user?.id || 'ANON'}</span>
          <span className="text-[#252A36]">|</span>
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#161920] border border-[#252A36] hover:border-[#58A6FF]/60 hover:text-[#E6EDF3] text-[#8B949E] text-[10px] cursor-pointer transition-colors"
            title="Open Universal Command Palette (Ctrl+K)"
          >
            <span>Command Bar</span>
            <kbd className="px-1 py-0.2 rounded-[1px] bg-[#0E1015] text-[9px] text-[#58A6FF] font-bold">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      <CommandPalette />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Fixed Navigation Sidebar */}
        <aside className="w-60 bg-[#161920] border-r border-[#252A36] flex flex-col justify-between shrink-0 font-mono text-[12px]">
          {/* Top Brand & Nav Section */}
          <div className="p-3.5 space-y-4">
            {/* Console Brand */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#252A36]">
              <div className="w-7 h-7 rounded-[3px] bg-[#0E1015] border border-[#252A36] flex items-center justify-center font-bold text-[11px] text-[#58A6FF]">
                LG
              </div>
              <div>
                <span className="font-bold text-[#E6EDF3] text-[13px] tracking-tight block">
                  LEXIGUARD
                </span>
                <span className="text-[10px] text-[#8B949E] block -mt-0.5">
                  Policy Intelligence Console
                </span>
              </div>
            </div>

            {/* Tenant Boundary Indicator */}
            <div className="p-2.5 rounded-[3px] bg-[#0E1015] border border-[#252A36] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold flex items-center justify-between">
                <span>Boundary Shard</span>
                <span className="text-[#3FB950] font-mono text-[9px] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-[1px] bg-[#238636]" />
                  ACTIVE
                </span>
              </div>
              <div className="text-[12px] font-semibold text-[#E6EDF3] font-sans truncate">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-[#58A6FF] font-mono">{currentTenant.id}</div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#484F58] px-2 py-1 font-bold">
                Workstation Subsystems
              </div>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-[3px] text-[12px] transition-colors ${
                      isActive
                        ? 'bg-[#1F232D] text-[#E6EDF3] font-semibold border-l-2 border-[#58A6FF]'
                        : 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#1F232D]/60 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#58A6FF]' : 'text-[#8B949E]'}`} />
                      <span className="font-sans text-[12px]">{item.label}</span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-[#0E1015] border border-[#252A36] text-[#8B949E]">
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Session Switcher / Sign Out */}
          <div className="p-3 border-t border-[#252A36] bg-[#161920] relative">
            {personaMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#161920] border border-[#30363D] rounded-[4px] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-bottom-1 duration-100 font-mono">
                <div className="px-2 py-1 text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold border-b border-[#252A36] mb-1">
                  Switch Corporate Persona
                </div>

                {/* Persona 1: Sonjoy */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sonjoy');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#1F232D] text-left text-[11px] flex items-center justify-between text-[#E6EDF3] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#0C1C36] text-[#58A6FF] border border-[#1F3A60] flex items-center justify-center text-[9px] font-bold">
                      SB
                    </span>
                    <span>Sonjoy Biswas</span>
                  </div>
                  <span className="text-[9px] text-[#58A6FF] font-bold">ORG_ADMIN</span>
                </button>

                {/* Persona 2: Dr. Sarah */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sarah');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#1F232D] text-left text-[11px] flex items-center justify-between text-[#E6EDF3] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#2E2208] text-[#E3B341] border-[#5E440E] flex items-center justify-center text-[9px] font-bold">
                      SK
                    </span>
                    <span>Dr. Sarah Khan</span>
                  </div>
                  <span className="text-[9px] text-[#E3B341] font-bold">AUDITOR</span>
                </button>

                {/* Persona 3: Alex Rivera */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('alex');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#1F232D] text-left text-[11px] flex items-center justify-between text-[#E6EDF3] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#1F232D] text-[#8B949E] border border-[#30363D] flex items-center justify-center text-[9px] font-bold">
                      AR
                    </span>
                    <span>Alex Rivera</span>
                  </div>
                  <span className="text-[9px] text-[#8B949E] font-bold">MEMBER</span>
                </button>

                <div className="border-t border-[#252A36] my-1" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#2A1215] text-[#F85149] text-left text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#F85149]" />
                  <span>Terminate Session (Sign Out)</span>
                </button>
              </div>
            )}

            {/* Profile Bar Button */}
            <button
              type="button"
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="w-full p-2 rounded-[3px] bg-[#0E1015] border border-[#252A36] hover:border-[#30363D] transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-[2px] bg-[#1F232D] border border-[#30363D] text-[#E6EDF3] flex items-center justify-center font-bold text-[10px] shrink-0">
                  {user?.avatarText || 'ID'}
                </div>
                <div className="truncate">
                  <div className="text-[12px] font-semibold text-[#E6EDF3] font-sans truncate">
                    {user?.name || 'Corporate User'}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[8px] px-1 py-0.1 rounded-[2px] border font-mono font-bold ${roleBadgeStyle}`}>
                      {user?.role || 'MEMBER'}
                    </span>
                    <span className="text-[9px] text-[#8B949E] font-mono truncate">
                      {user?.email ? user.email.split('@')[1] : 'internal'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#8B949E] transition-transform ${
                  personaMenuOpen ? 'rotate-180 text-[#58A6FF]' : ''
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0E1015]">
          {children}
        </main>
      </div>
    </div>
  );
}

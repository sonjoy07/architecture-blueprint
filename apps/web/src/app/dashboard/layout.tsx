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
  Building2,
  Lock,
  Layers,
  Sparkles,
  UserCheck,
  Activity,
  User,
} from 'lucide-react';
import {
  useAuthTenant,
  CORPORATE_PERSONAS,
  ROLE_DEFINITIONS,
} from '../../context/AuthTenantContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, currentTenant, logout, loginAsPersona, isReady } = useAuthTenant();
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 space-y-4 font-mono text-xs">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-slate-500">Verifying Zero-Trust Session &amp; Shard Tokens...</p>
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

  const roleBadgeColor =
    user?.role === 'ORG_ADMIN'
      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
      : user?.role === 'COMPLIANCE_AUDITOR'
      ? 'bg-amber-950 text-amber-300 border-amber-800'
      : 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans select-none">
      {/* Top Global Telemetry Strip */}
      <div className="h-7 bg-slate-950 border-b border-slate-900 px-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYS_KERNEL: NOMINAL</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Lock className="w-3 h-3 text-cyan-500" />
            <span>RLS_SHARD: {currentTenant.id.toUpperCase()}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-500 hidden sm:inline">
            ENGINE: pgvector-16.2 / HNSW Cosine (1536-dim)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden md:inline">
            PARTITION: {currentTenant.shardId || 'shard-us-east-4a'}
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 font-medium">SESSION: {user?.id || 'ANON'}</span>
        </div>
      </div>

      {/* Main Workspace with Left Sidebar & Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Fixed Navigation Sidebar */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 font-mono text-xs">
          {/* Top Brand & Nav Section */}
          <div className="p-4 space-y-6">
            {/* Console Brand */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded bg-slate-950 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 shadow-inner">
                LG
              </div>
              <div>
                <span className="font-bold text-slate-100 text-sm tracking-tight block">
                  LEXIGUARD
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5">
                  B2B Compliance Vault
                </span>
              </div>
            </div>

            {/* Tenant Boundary Indicator */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
                <span>Active Boundary</span>
                <span className="text-emerald-400">CONNECTED</span>
              </div>
              <div className="text-xs font-bold text-slate-200 font-sans truncate">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono">{currentTenant.id}</div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 px-2 py-1 font-bold">
                Workstation Subsystems
              </div>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-500">
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Session Switcher / Sign Out */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/90 relative">
            {personaMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 mb-1">
                  Switch Corporate Persona
                </div>

                {/* Persona 1: Sonjoy */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sonjoy');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded hover:bg-slate-800 text-left text-[11px] flex items-center justify-between text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700 flex items-center justify-center text-[10px] font-bold">
                      SB
                    </span>
                    <span>Sonjoy Biswas</span>
                  </div>
                  <span className="text-[9px] text-cyan-400 font-bold">ORG_ADMIN</span>
                </button>

                {/* Persona 2: Dr. Sarah */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sarah');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded hover:bg-slate-800 text-left text-[11px] flex items-center justify-between text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-700 flex items-center justify-center text-[10px] font-bold">
                      SK
                    </span>
                    <span>Dr. Sarah Khan</span>
                  </div>
                  <span className="text-[9px] text-amber-400 font-bold">AUDITOR</span>
                </button>

                {/* Persona 3: Alex Rivera */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('alex');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded hover:bg-slate-800 text-left text-[11px] flex items-center justify-between text-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                      AR
                    </span>
                    <span>Alex Rivera</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold">MEMBER</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full p-1.5 rounded hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-left text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Terminate Session &amp; Sign Out</span>
                </button>
              </div>
            )}

            {/* Profile Bar Button */}
            <button
              type="button"
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.avatarText || 'ID'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 font-sans truncate group-hover:text-cyan-300">
                    {user?.name || 'Corporate User'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] px-1 py-0.1 rounded border font-mono font-bold ${roleBadgeColor}`}>
                      {user?.role || 'MEMBER'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono truncate">
                      {user?.email ? user.email.split('@')[1] : 'internal'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  personaMenuOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

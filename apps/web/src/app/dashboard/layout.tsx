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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-[#64748B] space-y-3 font-mono text-[12px]">
        <div className="w-6 h-6 rounded-[2px] border border-[#CBD5E1] border-t-[#2563EB] animate-spin" />
        <p className="text-[#64748B]">Initializing cryptographic session tokens...</p>
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
      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
      : user?.role === 'COMPLIANCE_AUDITOR'
      ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
      : 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans select-none leading-tight">
      {/* Top Global Telemetry Strip */}
      <div className="h-7 bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 flex items-center justify-between text-[11px] font-mono text-[#64748B]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#16A34A]" />
            <span>SYS_KERNEL: NOMINAL</span>
          </div>
          <span className="text-[#CBD5E1]">|</span>
          <div className="flex items-center gap-1.5 text-[#475569]">
            <Lock className="w-3 h-3 text-[#2563EB]" />
            <span>RLS_SHARD: <strong className="text-[#0F172A]">{currentTenant.id.toUpperCase()}</strong></span>
          </div>
          <span className="text-[#CBD5E1] hidden sm:inline">|</span>
          <span className="text-[#64748B] hidden sm:inline">
            ENGINE: pgvector-16.2 / HNSW Cosine (1536-dim)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#64748B] hidden md:inline">
            PARTITION: {currentTenant.shardId || 'shard-us-east-4a'}
          </span>
          <span className="text-[#CBD5E1] hidden md:inline">|</span>
          <span className="text-[#475569]">SESSION: {user?.id || 'ANON'}</span>
          <span className="text-[#CBD5E1]">|</span>
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] hover:text-[#0F172A] text-[#475569] text-[10px] cursor-pointer transition-colors"
            title="Open Universal Command Palette (Ctrl+K)"
          >
            <span>Command Bar</span>
            <kbd className="px-1 py-0.2 rounded-[1px] bg-[#F1F5F9] text-[9px] text-[#2563EB] font-bold border border-[#E2E8F0]">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>

      <CommandPalette />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Fixed Navigation Sidebar */}
        <aside className="w-60 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 font-mono text-[12px]">
          {/* Top Brand & Nav Section */}
          <div className="p-3.5 space-y-4">
            {/* Console Brand */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-[3px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center font-bold text-[11px] text-[#2563EB]">
                LG
              </div>
              <div>
                <span className="font-bold text-[#0F172A] text-[13px] tracking-tight block">
                  LEXIGUARD
                </span>
                <span className="text-[10px] text-[#64748B] block -mt-0.5">
                  Policy Intelligence Console
                </span>
              </div>
            </div>

            {/* Tenant Boundary Indicator */}
            <div className="p-2.5 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold flex items-center justify-between">
                <span>Boundary Shard</span>
                <span className="text-[#15803D] font-mono text-[9px] flex items-center gap-1">
                  <span className="w-1 h-1 rounded-[1px] bg-[#16A34A]" />
                  ACTIVE
                </span>
              </div>
              <div className="text-[12px] font-semibold text-[#0F172A] font-sans truncate">
                {currentTenant.name}
              </div>
              <div className="text-[10px] text-[#2563EB] font-mono">{currentTenant.id}</div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-[#94A3B8] px-2 py-1 font-bold">
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
                        ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold border-l-2 border-[#2563EB]'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                      <span className="font-sans text-[12px]">{item.label}</span>
                    </div>
                    <span className="text-[9px] px-1 py-0.2 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B]">
                      {item.badge}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Session Switcher / Sign Out */}
          <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] relative">
            {personaMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#FFFFFF] border border-[#CBD5E1] rounded-[4px] p-2 space-y-1 z-50 shadow-md font-mono">
                <div className="px-2 py-1 text-[10px] text-[#64748B] uppercase tracking-wider font-semibold border-b border-[#E2E8F0] mb-1">
                  Switch Corporate Persona
                </div>

                {/* Persona 1: Sonjoy */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sonjoy');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#F1F5F9] text-left text-[11px] flex items-center justify-between text-[#0F172A] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] flex items-center justify-center text-[9px] font-bold">
                      SB
                    </span>
                    <span>Sonjoy Biswas</span>
                  </div>
                  <span className="text-[9px] text-[#1D4ED8] font-bold">ORG_ADMIN</span>
                </button>

                {/* Persona 2: Dr. Sarah */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('sarah');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#F1F5F9] text-left text-[11px] flex items-center justify-between text-[#0F172A] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] flex items-center justify-center text-[9px] font-bold">
                      SK
                    </span>
                    <span>Dr. Sarah Khan</span>
                  </div>
                  <span className="text-[9px] text-[#B45309] font-bold">AUDITOR</span>
                </button>

                {/* Persona 3: Alex Rivera */}
                <button
                  type="button"
                  onClick={() => {
                    loginAsPersona('alex');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#F1F5F9] text-left text-[11px] flex items-center justify-between text-[#0F172A] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-[2px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] flex items-center justify-center text-[9px] font-bold">
                      AR
                    </span>
                    <span>Alex Rivera</span>
                  </div>
                  <span className="text-[9px] text-[#475569] font-bold">MEMBER</span>
                </button>

                <div className="border-t border-[#E2E8F0] my-1" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-full p-1.5 rounded-[3px] hover:bg-[#FEE2E2] text-[#B91C1C] text-left text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Terminate Session (Sign Out)</span>
                </button>
              </div>
            )}

            {/* Profile Bar Button */}
            <button
              type="button"
              onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
              className="w-full p-2 rounded-[3px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-[2px] bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center font-bold text-[10px] shrink-0">
                  {user?.avatarText || 'ID'}
                </div>
                <div className="truncate">
                  <div className="text-[12px] font-semibold text-[#0F172A] font-sans truncate">
                    {user?.name || 'Corporate User'}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[8px] px-1 py-0.1 rounded-[2px] border font-mono font-bold ${roleBadgeStyle}`}>
                      {user?.role || 'MEMBER'}
                    </span>
                    <span className="text-[9px] text-[#64748B] font-mono truncate">
                      {user?.email ? user.email.split('@')[1] : 'internal'}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${
                  personaMenuOpen ? 'rotate-180 text-[#2563EB]' : ''
                }`}
              />
            </button>
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}

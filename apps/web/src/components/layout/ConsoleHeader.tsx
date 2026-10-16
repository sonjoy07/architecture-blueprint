'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Terminal,
  Activity,
  UserCheck,
  FileText,
  MessageSquare,
  ClipboardList,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuthTenant, ROLE_DEFINITIONS } from '../../context/AuthTenantContext';
import { UserRole, TenantId } from '../../types';

export function ConsoleHeader() {
  const pathname = usePathname();
  const { currentTenant, user, availableTenants, availableRoles, switchTenant, switchRole } =
    useAuthTenant();

  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toTimeString().split(' ')[0] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      href: '/dashboard/copilot',
      label: 'Policy Investigation',
      icon: MessageSquare,
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
      badge: 'Audit Trail',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-200 select-none">
      {/* Top Industrial Telemetry Strip */}
      <div className="h-6 bg-slate-950 border-b border-slate-900 px-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYS_KERNEL: NOMINAL</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Lock className="w-3 h-3 text-cyan-500" />
            <span>RLS_PARTITION: {currentTenant.id.toUpperCase()}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500 hidden sm:inline">
            ENGINE: pgvector-16.2 / HNSW Cosine (m=16, ef=128)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden md:inline">SHARD: {currentTenant.shardId || 'shard-us-east-4a'}</span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 font-medium">{utcTime || '00:00:00 UTC'}</span>
        </div>
      </div>

      {/* Main Console Bar */}
      <div className="px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard/copilot" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-cyan-400 shadow-inner group-hover:border-cyan-500 transition-colors">
              LG
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2 font-mono">
                LEXIGUARD <span className="text-[10px] font-mono text-slate-400 font-normal">v2.4.0-enterprise</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Zero-Egress Multi-Tenant Console</span>
            </div>
          </Link>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Tenant & RBAC Controls */}
        <div className="flex items-center gap-3">
          {/* Active Tenant / Organization Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setTenantDropdownOpen(!tenantDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-mono transition-all cursor-pointer"
              title="Active Organizational Partition"
            >
              <div className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
                <Building2 className="w-3 h-3" />
              </div>
              <div className="text-left flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-100">{currentTenant.name}</span>
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1 rounded">
                    {currentTenant.id}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 font-mono text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  Switch Active Tenant Boundary
                </div>
                <div className="py-1">
                  {availableTenants.map((t) => {
                    const isSelected = t.id === currentTenant.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          switchTenant(t.id);
                          setTenantDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-start justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/80 text-cyan-400'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            <span>{t.name}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({t.id})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{t.plan}</div>
                        </div>
                        {isSelected && <span className="text-cyan-400 font-bold">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active RBAC Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setTenantDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-850 text-xs font-mono transition-all cursor-pointer"
              title="Active Role-Based Access Control Profile"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  user?.role === 'ORG_ADMIN'
                    ? 'bg-emerald-400'
                    : user?.role === 'COMPLIANCE_AUDITOR'
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
              />
              <div className="text-left flex flex-col">
                <span className="font-bold text-slate-100">{user?.role || 'MEMBER'}</span>
                <span className="text-[9px] text-slate-400 truncate max-w-[110px] sm:max-w-[130px]">
                  {user?.name || 'Authorized Session'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 font-mono text-xs animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                  Simulate RBAC User Role
                </div>
                <div className="py-1">
                  {availableRoles.map((roleKey) => {
                    const isSelected = user?.role === roleKey;
                    const def = ROLE_DEFINITIONS[roleKey];
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          switchRole(roleKey);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left transition-colors cursor-pointer border-b border-slate-800/40 last:border-none ${
                          isSelected
                            ? 'bg-slate-800/80 text-cyan-400'
                            : 'hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                roleKey === 'ORG_ADMIN'
                                  ? 'bg-emerald-400'
                                  : roleKey === 'COMPLIANCE_AUDITOR'
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            />
                            {def.label}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {roleKey}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans mt-1 leading-snug">
                          {def.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden border-t border-slate-850 px-4 py-1.5 flex items-center gap-2 overflow-x-auto text-xs font-mono bg-slate-950">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1 rounded whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}

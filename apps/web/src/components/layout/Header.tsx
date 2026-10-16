'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  ChevronDown,
  CheckCircle2,
  FileText,
  MessageSquare,
  Sparkles,
  Lock,
  Layers,
  Info,
} from 'lucide-react';
import { useTenant } from '../../lib/tenant-context';

export function Header() {
  const pathname = usePathname();
  const { currentTenant, setTenant, availableTenants } = useTenant();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { href: '/copilot', label: 'Policy Copilot', icon: MessageSquare },
    { href: '/documents', label: 'Compliance Vault', icon: FileText },
  ];

  const isTenantAcme = currentTenant.name.includes('Acme');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/copilot" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-indigo-100" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight flex items-center gap-2">
                LexiGuard Copilot
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  Enterprise 2026
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                Autonomous Corporate Policy & Regulatory Knowledge Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/copilot' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Real-World Enterprise Security & Compliance Badge (Catchy & Trustworthy) */}
        <div
          className="relative hidden lg:flex items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/90 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs cursor-help transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold tracking-tight text-[11px]">
              {isTenantAcme
                ? 'SOC 2 Type II Certified | Zero-Egress Shield'
                : 'HIPAA & HITECH Compliant | ePHI Guarded'}
            </span>
          </div>

          {/* Interactive Technical Verification Hover Tooltip */}
          {showTooltip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-3 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed shadow-2xl border border-slate-700 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Audited Cryptographic Isolation</span>
              </div>
              <p className="text-slate-300 text-[10px]">
                Data partition mathematically enforced at database kernel level. Cryptographic workspace session locks guarantee zero cross-organization leakage under SOC 2 Type II controls.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between font-mono text-[9px] text-slate-400">
                <span>Encryption: AES-256 (CMEK)</span>
                <span>Audit Trail: Immutable WORM</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Enterprise Organization Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              aria-label="Switch Enterprise Workspace"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left flex flex-col">
                <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[180px]">
                  {currentTenant.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {isTenantAcme ? 'Global Enterprise Tier' : 'Healthcare Security Tier'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Enterprise Workspaces
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                    Select isolated organizational compliance partition
                  </span>
                </div>

                <div className="py-1">
                  {availableTenants.map((tenant) => {
                    const isSelected = tenant.id === currentTenant.id;
                    return (
                      <button
                        key={tenant.id}
                        onClick={() => {
                          setTenant(tenant);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-start justify-between gap-3 text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {tenant.name}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            Compliance: {tenant.plan.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {tenant.complianceTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Database,
  Building2,
  ChevronDown,
  CheckCircle2,
  Activity,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useTenant } from '../../lib/tenant-context';

export function Header() {
  const pathname = usePathname();
  const { currentTenant, setTenant, availableTenants } = useTenant();
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    { href: '/copilot', label: 'Knowledge Copilot', icon: MessageSquare },
    { href: '/documents', label: 'Document Ingestion', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/copilot" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-500 transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight flex items-center gap-2">
                Enterprise Copilot
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  v2.4
                </span>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Multi-Tenant Document & Policy Knowledge Base
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/copilot' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center/Right: Live System Health Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-mono text-[11px] font-semibold tracking-tight">
            PostgreSQL RLS Active | pgvector Ready
          </span>
        </div>

        {/* Right: Tenant Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-xs transition-colors"
              aria-label="Switch Enterprise Tenant"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-500" />
              <div className="text-left flex flex-col">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px] sm:max-w-[200px]">
                  {currentTenant.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  x-tenant-id: {currentTenant.id.slice(0, 8)}...
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Enterprise Multi-Tenancy Boundary
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 block mt-0.5">
                    Data partitioned via database kernel RLS
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
                        className={`w-full px-3 py-2 text-left flex items-start justify-between gap-2 text-xs transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {tenant.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 mt-0.5">
                            ID: {tenant.id}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            {tenant.complianceTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User / Zero-Trust Status */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-semibold"
              title="Admin Identity (Zero Egress Verified)"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '../lib/tenant-context';

export function Navbar() {
  const pathname = usePathname();
  const { currentTenant, setTenant, availableTenants } = useTenant();

  const navLinks = [
    { href: '/copilot', label: 'Copilot Chat' },
    { href: '/documents', label: 'Policy Documents' },
    { href: '/policies', label: 'Compliance & Guardrails' },
  ];

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-8">
        <Link href="/copilot" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
            AG
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight block">
              Enterprise Copilot
            </span>
            <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
              Multi-Tenant RAG v2.4
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: Tenant Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-medium text-slate-500">
            Tenant:
          </span>
          <select
            value={currentTenant.id}
            onChange={(e) => {
              const matched = availableTenants.find((t) => t.id === e.target.value);
              if (matched) setTenant(matched);
            }}
            className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {availableTenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
          JD
        </div>
      </div>
    </header>
  );
}

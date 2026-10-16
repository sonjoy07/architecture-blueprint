'use client';

import React from 'react';
import { ConsoleHeader } from '../../components/layout/ConsoleHeader';
import { useAuthTenant } from '../../context/AuthTenantContext';
import { ShieldCheck } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady } = useAuthTenant();

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200 space-y-4 font-mono">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <ShieldCheck className="w-5 h-5 text-cyan-400 absolute" />
        </div>
        <p className="text-xs text-slate-400">Initializing LexiGuard Multi-Tenant Shards &amp; RBAC Kernel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <ConsoleHeader />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

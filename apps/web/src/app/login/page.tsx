'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../../lib/auth-context';
import { useTenant } from '../../lib/tenant-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, loginAs, loginWithEmail } = useAuth();
  const { setTenant, availableTenants } = useTenant();

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, redirect to copilot
  useEffect(() => {
    if (user) {
      router.push('/copilot');
    }
  }, [user, router]);

  const handleSelectPreset = async (presetKey: 'acme' | 'nexus' | 'auditor') => {
    setIsAuthenticating(true);
    setErrorMsg('');
    await new Promise((r) => setTimeout(r, 450));

    loginAs(presetKey);
    const targetUser = PRESET_USERS[presetKey];
    const targetTenant = availableTenants.find((t) => t.id === targetUser.tenantId);
    if (targetTenant) {
      setTenant(targetTenant);
    }
    router.push('/copilot');
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || isAuthenticating) return;

    if (!customEmail.includes('@') || !customEmail.includes('.')) {
      setErrorMsg('Please enter a valid corporate email address (e.g. employee@acme.com).');
      return;
    }

    setIsAuthenticating(true);
    setErrorMsg('');
    await new Promise((r) => setTimeout(r, 600));

    loginWithEmail(customEmail, customName);
    router.push('/copilot');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 shadow-2xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold tracking-tight text-[11px]">
              Zero-Egress SSO & Corporate Identity Gateway
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            <span className="bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              LexiGuard Copilot
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Single-Tenant Regulatory Knowledge Vault. Sign in to access your organization&apos;s cryptographically isolated policies and AI copilot.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Quick 1-Click Demo SSO Personas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Select Corporate Persona (One-Click SSO)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Simulated IdP</span>
            </div>

            <div className="space-y-2.5">
              {/* Persona 1: Acme Corp */}
              <button
                type="button"
                onClick={() => handleSelectPreset('acme')}
                disabled={isAuthenticating}
                className="w-full p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/80 bg-slate-950/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    SJ
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Sarah Jenkins</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Acme Corporation
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>sarah.jenkins@acme.com</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Security Admin</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 2: Nexus Dynamics */}
              <button
                type="button"
                onClick={() => handleSelectPreset('nexus')}
                disabled={isAuthenticating}
                className="w-full p-4 rounded-2xl border border-slate-800 hover:border-teal-500/80 bg-slate-950/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    MV
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Dr. Marcus Vance</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                        Nexus Dynamics Inc.
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>m.vance@nexusdynamics.com</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Compliance Officer</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 3: Third-Party Auditor */}
              <button
                type="button"
                onClick={() => handleSelectPreset('auditor')}
                disabled={isAuthenticating}
                className="w-full p-4 rounded-2xl border border-slate-800 hover:border-amber-500/80 bg-slate-950/60 hover:bg-slate-800/60 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                    ER
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">Elena Rostova</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                        External SOC 2 Auditor
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>e.rostova@kpmg-audit.com</span>
                      <span>•</span>
                      <span className="text-amber-400 font-medium">Multi-Workspace Auditor</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider relative shrink-0">
              Or Custom Corporate Email
            </span>
          </div>

          {/* Custom Corporate Email Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                required
                placeholder="Corporate Email (e.g. yourname@acme.com)"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                disabled={isAuthenticating}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!customEmail.trim() || isAuthenticating}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isAuthenticating ? 'Authenticating SSO...' : 'Sign in with Corporate SSO'}</span>
            </button>
          </form>

          {/* Security Guarantee Box */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              FIDO2 WebAuthn MFA Enforced
            </span>
            <span className="font-mono">Audit Hash: #0x92f...7e</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Protected by Automated Row-Level Security & Single-Tenant Cryptographic Partitioning.
          </p>
          <p className="text-[10px] text-slate-600">
            Compliant with SOC 2 Type II, HIPAA Security Rule, and GDPR Article 17.
          </p>
        </div>
      </div>
    </div>
  );
}

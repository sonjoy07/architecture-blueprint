'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Terminal,
  Building2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Fingerprint,
} from 'lucide-react';
import { useAuthTenant, CORPORATE_PERSONAS } from '../../context/AuthTenantContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginAsPersona, loginWithSso } = useAuthTenant();

  const [ssoEmail, setSsoEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // If already authenticated, redirect to /dashboard/copilot
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard/copilot');
    }
  }, [isAuthenticated, router]);

  const handlePersonaSelect = (personaKey: 'sonjoy' | 'sarah' | 'alex') => {
    setIsAuthenticating(true);
    setAuthError('');
    loginAsPersona(personaKey);
    setTimeout(() => {
      router.push('/dashboard/copilot');
    }, 250);
  };

  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssoEmail.trim() || isAuthenticating) return;

    if (!ssoEmail.includes('@') || !ssoEmail.includes('.')) {
      setAuthError('Please specify a valid corporate identity email (e.g., identity@acmewave.internal).');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');

    // Determine tenant by email domain
    const isAcme = ssoEmail.includes('acme');
    loginWithSso(
      ssoEmail.trim(),
      isAcme ? 't_acme_corp' : 't_nexus_health',
      isAcme ? 'ORG_ADMIN' : 'MEMBER'
    );

    setTimeout(() => {
      router.push('/dashboard/copilot');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans">
      {/* Container */}
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-semibold uppercase tracking-wider">
              Zero-Trust Identity Broker // Gateway
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            LEXIGUARD <span className="text-cyan-400">POLICY CONSOLE</span>
          </h1>
          <p className="text-xs text-slate-400 font-sans max-w-md mx-auto">
            Mandatory Single-Tenant Authentication Gate. All access is cryptographically bound to customer RLS shards with immutable audit trails.
          </p>
        </div>

        {/* Industrial Authentication Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-6 font-mono text-xs">
          {/* Persona Switcher Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Select Enterprise Persona (Instant IAM Token)
              </span>
              <span className="text-[10px] text-slate-500">Demo Environment</span>
            </div>

            <div className="space-y-2">
              {/* Persona 1: Sonjoy Biswas (ORG_ADMIN) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sonjoy')}
                disabled={isAuthenticating}
                className="w-full p-3.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/80 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    SB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs font-sans">Sonjoy Biswas</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                        ORG_ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>t_acme_corp</span>
                      <span className="text-slate-600">&middot;</span>
                      <span className="text-slate-300">Infra &amp; Org Administrator</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 2: Dr. Sarah Khan (COMPLIANCE_AUDITOR) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sarah')}
                disabled={isAuthenticating}
                className="w-full p-3.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/80 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-amber-950/80 border border-amber-700/60 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    SK
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs font-sans">Dr. Sarah Khan</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        COMPLIANCE_AUDITOR
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>t_acme_corp</span>
                      <span className="text-slate-600">&middot;</span>
                      <span className="text-slate-300">Chief Compliance Officer</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 3: Alex Rivera (MEMBER) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('alex')}
                disabled={isAuthenticating}
                className="w-full p-3.5 rounded bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-600 text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-850 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-xs font-sans">Alex Rivera</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                        MEMBER
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                      <span>t_nexus_health</span>
                      <span className="text-slate-600">&middot;</span>
                      <span className="text-slate-300">External Health Consultant</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest relative shrink-0">
              Or Federated Okta / SAML
            </span>
          </div>

          {/* Enterprise SSO Form */}
          <form onSubmit={handleSsoSubmit} className="space-y-3">
            {authError && (
              <div className="p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                Corporate Identity Address
              </label>
              <input
                type="email"
                required
                value={ssoEmail}
                onChange={(e) => setSsoEmail(e.target.value)}
                placeholder="identity@organization.internal"
                disabled={isAuthenticating}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!ssoEmail.trim() || isAuthenticating}
              className="w-full py-2.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 font-mono"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAuthenticating ? 'Exchanging Okta Assertions...' : 'Sign in with Okta / SAML'}</span>
            </button>
          </form>

          {/* Security Guarantee Strip */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>FIDO2 WebAuthn / SAML 2.0 Bound</span>
            </span>
            <span>TOKEN_TTL: 28800s</span>
          </div>
        </div>

        {/* Footer Audit Information */}
        <div className="text-center text-[10px] text-slate-600 font-mono space-y-0.5">
          <p>LEXIGUARD B2B KERNEL &middot; ROW-LEVEL POSTGRESQL SHARDING ACTIVE</p>
          <p>All unauthorized attempts are intercepted and recorded to immutable compliance ledgers.</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ArrowRight,
  Terminal,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useAuthTenant } from '../../context/AuthTenantContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loginAsPersona, loginWithSso } = useAuthTenant();

  const [ssoEmail, setSsoEmail] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

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
    }, 200);
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

    const isAcme = ssoEmail.includes('acme');
    loginWithSso(
      ssoEmail.trim(),
      isAcme ? 't_acme_corp' : 't_nexus_health',
      isAcme ? 'ORG_ADMIN' : 'MEMBER'
    );

    setTimeout(() => {
      router.push('/dashboard/copilot');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-center items-center p-4 select-none font-sans leading-tight">
      {/* Container */}
      <div className="w-full max-w-lg space-y-4">
        {/* Brand Terminal Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] text-[10px] font-mono text-[#1D4ED8]">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#16A34A]" />
            <span className="font-semibold uppercase tracking-wider">
              Zero-Trust Identity Gateway // SAML 2.0
            </span>
          </div>

          <h1 className="text-[18px] font-bold tracking-tight text-[#0F172A] font-mono">
            LEXIGUARD <span className="text-[#2563EB]">POLICY CONSOLE</span>
          </h1>
          <p className="text-[12px] text-[#64748B] font-sans max-w-md mx-auto">
            Mandatory Single-Tenant Authentication Gate. Access is cryptographically bound to customer RLS shards.
          </p>
        </div>

        {/* Industrial Authentication Card */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[4px] p-5 space-y-4 font-mono text-[12px] shadow-sm">
          {/* Persona Switcher Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-1.5">
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#2563EB]" />
                Select Enterprise Persona (Instant IAM Session)
              </span>
              <span className="text-[9px] text-[#94A3B8]">Simulated IdP</span>
            </div>

            <div className="space-y-1.5">
              {/* Persona 1: Sonjoy Biswas (ORG_ADMIN) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sonjoy')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    SB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A] text-[12px] font-sans">Sonjoy Biswas</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-bold">
                        ORG_ADMIN
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_acme_corp</span>
                      <span className="text-[#CBD5E1]">&middot;</span>
                      <span>Infra &amp; Org Administrator</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#2563EB] transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 2: Dr. Sarah Khan (COMPLIANCE_AUDITOR) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sarah')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    SK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A] text-[12px] font-sans">Dr. Sarah Khan</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] font-bold">
                        AUDITOR
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_acme_corp</span>
                      <span className="text-[#CBD5E1]">&middot;</span>
                      <span>Chief Compliance Officer</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#B45309] transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 3: Alex Rivera (MEMBER) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('alex')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#0F172A] text-[12px] font-sans">Alex Rivera</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] font-bold">
                        MEMBER
                      </span>
                    </div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_nexus_health</span>
                      <span className="text-[#CBD5E1]">&middot;</span>
                      <span>External Health Consultant</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0F172A] transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E2E8F0] w-full" />
            <span className="bg-[#FFFFFF] px-2 text-[9px] font-mono text-[#94A3B8] uppercase tracking-widest relative shrink-0">
              Or Federated Okta / SAML
            </span>
          </div>

          {/* Enterprise SSO Form */}
          <form onSubmit={handleSsoSubmit} className="space-y-2.5">
            {authError && (
              <div className="p-2 rounded-[2px] bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-[10px] flex items-center gap-1.5 font-mono">
                <AlertCircle className="w-3 h-3 shrink-0 text-[#B91C1C]" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[#64748B] block font-mono">
                Corporate Identity Address
              </label>
              <input
                type="email"
                required
                value={ssoEmail}
                onChange={(e) => setSsoEmail(e.target.value)}
                placeholder="identity@organization.internal"
                disabled={isAuthenticating}
                className="w-full bg-[#FFFFFF] border border-[#CBD5E1] rounded-[3px] px-2.5 py-1.5 text-[12px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#2563EB] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!ssoEmail.trim() || isAuthenticating}
              className="w-full py-1.5 rounded-[3px] bg-[#0F172A] hover:bg-[#1E293B] text-[#FFFFFF] border border-[#0F172A] font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 font-mono shadow-sm"
            >
              <KeyRound className="w-3 h-3 text-[#FFFFFF]" />
              <span>{isAuthenticating ? 'Exchanging Okta Assertions...' : 'Sign in with Okta / SAML'}</span>
            </button>
          </form>

          {/* Security Guarantee Strip */}
          <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px] text-[#64748B] font-mono">
            <span className="flex items-center gap-1 text-[#475569]">
              <Lock className="w-2.5 h-2.5 text-[#16A34A]" />
              <span>FIDO2 WebAuthn Enforced</span>
            </span>
            <span className="tabular-nums">TTL: 28800s</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-[#94A3B8] font-mono space-y-0.5">
          <p>LEXIGUARD B2B KERNEL &middot; ROW-LEVEL POSTGRESQL SHARDING ACTIVE</p>
        </div>
      </div>
    </div>
  );
}

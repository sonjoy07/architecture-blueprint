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
    <div className="min-h-screen bg-[#0E1015] text-[#E6EDF3] flex flex-col justify-center items-center p-4 select-none font-sans leading-tight">
      {/* Container */}
      <div className="w-full max-w-lg space-y-4">
        {/* Brand Terminal Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-[2px] bg-[#161920] border border-[#252A36] text-[10px] font-mono text-[#8B949E]">
            <span className="w-1.5 h-1.5 rounded-[1px] bg-[#238636]" />
            <span className="text-[#8B949E] font-semibold uppercase tracking-wider">
              Zero-Trust Identity Gateway // SAML 2.0
            </span>
          </div>

          <h1 className="text-[18px] font-bold tracking-tight text-[#E6EDF3] font-mono">
            LEXIGUARD <span className="text-[#58A6FF]">POLICY CONSOLE</span>
          </h1>
          <p className="text-[12px] text-[#8B949E] font-sans max-w-md mx-auto">
            Mandatory Single-Tenant Authentication Gate. Access is cryptographically bound to customer RLS shards.
          </p>
        </div>

        {/* Industrial Authentication Card */}
        <div className="bg-[#161920] border border-[#252A36] rounded-[4px] p-5 space-y-4 font-mono text-[12px]">
          {/* Persona Switcher Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-[#252A36] pb-1.5">
              <span className="text-[10px] font-semibold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#58A6FF]" />
                Select Enterprise Persona (Instant IAM Session)
              </span>
              <span className="text-[9px] text-[#484F58]">Simulated IdP</span>
            </div>

            <div className="space-y-1.5">
              {/* Persona 1: Sonjoy Biswas (ORG_ADMIN) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sonjoy')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#0D0F14] hover:bg-[#1F232D] border border-[#252A36] hover:border-[#30363D] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#0C1C36] border border-[#1F3A60] text-[#58A6FF] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    SB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#E6EDF3] text-[12px] font-sans">Sonjoy Biswas</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#0C1C36] border border-[#1F3A60] text-[#58A6FF] font-bold">
                        ORG_ADMIN
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_acme_corp</span>
                      <span className="text-[#484F58]">&middot;</span>
                      <span>Infra &amp; Org Administrator</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#484F58] group-hover:text-[#58A6FF] transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 2: Dr. Sarah Khan (COMPLIANCE_AUDITOR) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('sarah')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#0D0F14] hover:bg-[#1F232D] border border-[#252A36] hover:border-[#30363D] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#2E2208] border border-[#5E440E] text-[#E3B341] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    SK
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#E6EDF3] text-[12px] font-sans">Dr. Sarah Khan</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#2E2208] border border-[#5E440E] text-[#E3B341] font-bold">
                        AUDITOR
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_acme_corp</span>
                      <span className="text-[#484F58]">&middot;</span>
                      <span>Chief Compliance Officer</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#484F58] group-hover:text-[#E3B341] transition-all shrink-0 ml-2" />
              </button>

              {/* Persona 3: Alex Rivera (MEMBER) */}
              <button
                type="button"
                onClick={() => handlePersonaSelect('alex')}
                disabled={isAuthenticating}
                className="w-full p-2.5 rounded-[3px] bg-[#0D0F14] hover:bg-[#1F232D] border border-[#252A36] hover:border-[#30363D] text-left transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[2px] bg-[#1F232D] border border-[#30363D] text-[#8B949E] flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    AR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#E6EDF3] text-[12px] font-sans">Alex Rivera</span>
                      <span className="text-[8px] font-mono px-1 py-0.1 rounded-[2px] bg-[#1F232D] border border-[#30363D] text-[#8B949E] font-bold">
                        MEMBER
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] font-mono mt-0.5 flex items-center gap-1.5">
                      <span>t_nexus_health</span>
                      <span className="text-[#484F58]">&middot;</span>
                      <span>External Health Consultant</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#484F58] group-hover:text-[#E6EDF3] transition-all shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#252A36] w-full" />
            <span className="bg-[#161920] px-2 text-[9px] font-mono text-[#484F58] uppercase tracking-widest relative shrink-0">
              Or Federated Okta / SAML
            </span>
          </div>

          {/* Enterprise SSO Form */}
          <form onSubmit={handleSsoSubmit} className="space-y-2.5">
            {authError && (
              <div className="p-2 rounded-[2px] bg-[#2A1215] border border-[#DA3633]/60 text-[#F85149] text-[10px] flex items-center gap-1.5 font-mono">
                <AlertCircle className="w-3 h-3 shrink-0 text-[#F85149]" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-[#8B949E] block font-mono">
                Corporate Identity Address
              </label>
              <input
                type="email"
                required
                value={ssoEmail}
                onChange={(e) => setSsoEmail(e.target.value)}
                placeholder="identity@organization.internal"
                disabled={isAuthenticating}
                className="w-full bg-[#0D0F14] border border-[#30363D] rounded-[3px] px-2.5 py-1.5 text-[12px] text-[#E6EDF3] placeholder-[#484F58] focus:outline-none focus:border-[#58A6FF] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={!ssoEmail.trim() || isAuthenticating}
              className="w-full py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] font-medium text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 font-mono"
            >
              <KeyRound className="w-3 h-3 text-[#58A6FF]" />
              <span>{isAuthenticating ? 'Exchanging Okta Assertions...' : 'Sign in with Okta / SAML'}</span>
            </button>
          </form>

          {/* Security Guarantee Strip */}
          <div className="pt-2 border-t border-[#252A36] flex items-center justify-between text-[10px] text-[#484F58] font-mono">
            <span className="flex items-center gap-1 text-[#8B949E]">
              <Lock className="w-2.5 h-2.5 text-[#3FB950]" />
              <span>FIDO2 WebAuthn Enforced</span>
            </span>
            <span className="tabular-nums">TTL: 28800s</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-[#484F58] font-mono space-y-0.5">
          <p>LEXIGUARD B2B KERNEL &middot; ROW-LEVEL POSTGRESQL SHARDING ACTIVE</p>
        </div>
      </div>
    </div>
  );
}

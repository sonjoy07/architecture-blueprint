'use client';

import React from 'react';
import { ShieldAlert, Lock, User, Terminal, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuthTenant, ROLE_DEFINITIONS } from '../../context/AuthTenantContext';
import { Permission } from '../../types';

interface PermissionGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
  scopeTitle?: string;
}

export function PermissionGuard({
  requiredPermission,
  children,
  scopeTitle = 'Access Denied by Tenant Boundary Policy',
}: PermissionGuardProps) {
  const { user, currentTenant, hasPermission, switchRole } = useAuthTenant();

  const isAuthorized = hasPermission(requiredPermission);

  if (isAuthorized) {
    return <>{children}</>;
  }

  // Generate deterministic audit incident ID based on user and permission
  const auditIncidentId = `AUD-${Date.now().toString(36).toUpperCase()}-DENIED`;
  const roleName = user ? user.role : 'ANONYMOUS';
  const roleDef = user ? ROLE_DEFINITIONS[user.role] : null;

  return (
    <div className="flex-1 bg-[#0E1015] p-6 flex items-center justify-center font-mono select-none">
      <div className="max-w-xl w-full bg-[#161920] border border-[#252A36] rounded-[4px] p-6 text-xs space-y-4">
        {/* Header Incident Banner */}
        <div className="flex items-center gap-3 text-[#F85149] border-b border-[#252A36] pb-3">
          <div className="p-2 rounded-[3px] bg-[#DA3633]/15 border border-[#DA3633]/40">
            <ShieldAlert className="w-5 h-5 text-[#F85149]" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide uppercase text-[#E6EDF3]">
              403 Unauthorized: {scopeTitle}
            </div>
            <div className="text-[10px] text-[#8B949E] font-mono">
              SECURITY_INCIDENT_ID: <span className="text-[#F85149]">{auditIncidentId}</span>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-[#8B949E] text-xs leading-relaxed font-sans">
          Your active IAM session under persona <strong className="text-[#E6EDF3] font-mono">[{user?.name || 'Unknown'}]</strong> with role <strong className="text-[#E3B341] font-mono">[{roleName}]</strong> is prohibited from invoking this tenant subsystem. The operation requires cryptographic grant <code className="bg-[#0D0F14] px-1.5 py-0.5 rounded-[3px] border border-[#252A36] text-[#58A6FF]">{requiredPermission}</code>.
        </p>

        {/* Security Context Grid */}
        <div className="bg-[#0D0F14] p-3.5 rounded-[3px] border border-[#252A36] space-y-2 text-[11px]">
          <div className="flex justify-between text-[#8B949E]">
            <span>Enforced Boundary Shard:</span>
            <span className="text-[#58A6FF] font-bold">{currentTenant.shardId || 'shard-us-east-4a'}</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Tenant Namespace:</span>
            <span className="text-[#E6EDF3]">{currentTenant.name} ({currentTenant.id})</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Assigned Role:</span>
            <span className="text-[#E3B341] font-semibold">{roleDef?.label || roleName}</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Required IAM Capability:</span>
            <span className="text-[#58A6FF] font-bold">{requiredPermission}</span>
          </div>
          <div className="flex justify-between text-[#8B949E]">
            <span>Zero-Trust Policy:</span>
            <span className="text-[#3FB950]">STRICT_ZERO_EGRESS_ENFORCED</span>
          </div>
        </div>

        {/* Escalation and Persona Switcher Actions */}
        <div className="pt-2 border-t border-[#252A36] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`mailto:sonjoy.biswas@acmewave.internal?subject=IAM%20Permission%20Request%20for%20${requiredPermission}&body=Incident%20ID:%20${auditIncidentId}`}
            className="w-full sm:w-auto px-3 py-1.5 rounded-[3px] bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] border border-[#30363D] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#8B949E]" />
            <span>Contact Org Admin (Sonjoy)</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] text-[#484F58] font-sans hidden sm:inline">Demo Switch:</span>
            <button
              onClick={() => switchRole('ORG_ADMIN')}
              className="px-3 py-1.5 rounded-[3px] bg-[#238636] hover:bg-[#2EA043] text-white font-medium text-xs transition-colors cursor-pointer border border-[#2EA043]/50"
            >
              Elevate to ORG_ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

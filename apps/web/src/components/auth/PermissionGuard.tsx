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
    <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center font-mono select-none">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl text-xs space-y-4">
        {/* Header Incident Banner */}
        <div className="flex items-center gap-3 text-red-400 border-b border-slate-800 pb-3">
          <div className="p-2 rounded bg-red-950/60 border border-red-800/80">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide uppercase text-slate-100">
              403 Unauthorized: {scopeTitle}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              SECURITY_INCIDENT_ID: <span className="text-red-400">{auditIncidentId}</span>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-slate-300 text-xs leading-relaxed font-sans">
          Your active IAM session under persona <strong className="text-slate-100 font-mono">[{user?.name || 'Unknown'}]</strong> with role <strong className="text-amber-400 font-mono">[{roleName}]</strong> is prohibited from invoking this tenant subsystem. The operation requires cryptographic grant <code className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 text-cyan-400">{requiredPermission}</code>.
        </p>

        {/* Security Context Grid */}
        <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2 text-[11px]">
          <div className="flex justify-between text-slate-400">
            <span>Enforced Boundary Shard:</span>
            <span className="text-cyan-400 font-bold">{currentTenant.shardId || 'shard-us-east-4a'}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Tenant Namespace:</span>
            <span className="text-slate-200">{currentTenant.name} ({currentTenant.id})</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Assigned Role:</span>
            <span className="text-amber-300 font-semibold">{roleDef?.label || roleName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Required IAM Capability:</span>
            <span className="text-cyan-400 font-bold">{requiredPermission}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Zero-Trust Policy:</span>
            <span className="text-emerald-400">STRICT_ZERO_EGRESS_ENFORCED</span>
          </div>
        </div>

        {/* Escalation and Persona Switcher Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`mailto:sonjoy.biswas@acmewave.internal?subject=IAM%20Permission%20Request%20for%20${requiredPermission}&body=Incident%20ID:%20${auditIncidentId}`}
            className="w-full sm:w-auto px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Org Admin (Sonjoy)</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">Demo Switch:</span>
            <button
              onClick={() => switchRole('ORG_ADMIN')}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Elevate to ORG_ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

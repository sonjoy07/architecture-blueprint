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
    <div className="flex-1 bg-[#F8FAFC] p-6 flex items-center justify-center font-mono select-none">
      <div className="max-w-xl w-full bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-[4px] p-6 text-xs space-y-4">
        {/* Header Incident Banner */}
        <div className="flex items-center gap-3 text-[#B91C1C] border-b border-[#E2E8F0] pb-3">
          <div className="p-2 rounded-[3px] bg-[#FEF2F2] border border-[#FECACA]">
            <ShieldAlert className="w-5 h-5 text-[#B91C1C]" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide uppercase text-[#0F172A]">
              403 Unauthorized: {scopeTitle}
            </div>
            <div className="text-[10px] text-[#64748B] font-mono">
              SECURITY_INCIDENT_ID: <span className="text-[#B91C1C]">{auditIncidentId}</span>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-[#64748B] text-xs leading-relaxed font-sans">
          Your active IAM session under persona <strong className="text-[#0F172A] font-mono">[{user?.name || 'Unknown'}]</strong> with role <strong className="text-[#B45309] font-mono">[{roleName}]</strong> is prohibited from invoking this tenant subsystem. The operation requires cryptographic grant <code className="bg-[#EFF6FF] px-1.5 py-0.5 rounded-[3px] border border-[#BFDBFE] text-[#1D4ED8]">{requiredPermission}</code>.
        </p>

        {/* Security Context Grid */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-[3px] border border-[#E2E8F0] space-y-2 text-[11px]">
          <div className="flex justify-between text-[#64748B]">
            <span>Enforced Boundary Shard:</span>
            <span className="text-[#2563EB] font-bold">{currentTenant.shardId || 'shard-us-east-4a'}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Tenant Namespace:</span>
            <span className="text-[#0F172A]">{currentTenant.name} ({currentTenant.id})</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Assigned Role:</span>
            <span className="text-[#B45309] font-semibold">{roleDef?.label || roleName}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Required IAM Capability:</span>
            <span className="text-[#2563EB] font-bold">{requiredPermission}</span>
          </div>
          <div className="flex justify-between text-[#64748B]">
            <span>Zero-Trust Policy:</span>
            <span className="text-[#15803D]">STRICT_ZERO_EGRESS_ENFORCED</span>
          </div>
        </div>

        {/* Escalation and Persona Switcher Actions */}
        <div className="pt-2 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`mailto:sonjoy.biswas@acmewave.internal?subject=IAM%20Permission%20Request%20for%20${requiredPermission}&body=Incident%20ID:%20${auditIncidentId}`}
            className="w-full sm:w-auto px-3 py-1.5 rounded-[3px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Contact Org Admin (Sonjoy)</span>
          </a>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] text-[#64748B] font-sans hidden sm:inline">Demo Switch:</span>
            <button
              onClick={() => switchRole('ORG_ADMIN')}
              className="px-3 py-1.5 rounded-[3px] bg-[#16A34A] hover:bg-[#15803D] text-white font-medium text-xs transition-colors cursor-pointer border border-[#16A34A]"
            >
              Elevate to ORG_ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

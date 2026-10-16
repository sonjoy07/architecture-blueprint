'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tenant, UserSession, UserRole, Permission, TenantId } from '../types';

export const SYSTEM_TENANTS: Tenant[] = [
  {
    id: 't_acme_corp',
    name: 'Acme Corporation',
    code: 'ACME_CORP',
    plan: 'ENTERPRISE_SOC2',
    complianceTags: ['SOC 2 Type II', 'Zero-Egress Vault', 'Dedicated Shard A'],
    shardId: 'shard-us-east-4a',
    vectorDimensions: 1536,
    totalIndexedDocs: 6,
  },
  {
    id: 't_nexus_health',
    name: 'Nexus Dynamics Inc.',
    code: 'NEXUS_HEALTH',
    plan: 'HEALTHCARE_HIPAA',
    complianceTags: ['HIPAA & HITECH', 'ePHI Guarded', 'Dedicated Shard B'],
    shardId: 'shard-us-central-2b',
    vectorDimensions: 1536,
    totalIndexedDocs: 5,
  },
];

export const ROLE_DEFINITIONS: Record<
  UserRole,
  { label: string; description: string; permissions: Permission[] }
> = {
  ORG_ADMIN: {
    label: 'Organization Administrator',
    description: 'Full administrative access across document ingestion, RLS partitions, copilot execution, and compliance telemetry.',
    permissions: [
      'documents:write',
      'documents:delete',
      'copilot:query',
      'audit:read',
      'audit:export',
      'rls:configure',
    ],
  },
  COMPLIANCE_AUDITOR: {
    label: 'Compliance Auditor',
    description: 'Read-only access to PII redaction event logs, legal grounding certificates, and immutable audit trails. Ingestion and interactive query are prohibited.',
    permissions: ['audit:read', 'audit:export'],
  },
  MEMBER: {
    label: 'Enterprise Member',
    description: 'Standard query authorization against certified tenant policies. Restricted from viewing raw redaction telemetry or triggering document ingestion.',
    permissions: ['copilot:query'],
  },
};

interface AuthTenantContextValue {
  currentTenant: Tenant;
  user: UserSession;
  availableTenants: Tenant[];
  availableRoles: UserRole[];
  switchTenant: (tenantId: TenantId) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  getApiHeaders: (extraHeaders?: Record<string, string>) => Record<string, string>;
  isReady: boolean;
}

const AuthTenantContext = createContext<AuthTenantContextValue | undefined>(undefined);

export function AuthTenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(SYSTEM_TENANTS[0]);
  const [currentRole, setCurrentRole] = useState<UserRole>('ORG_ADMIN');
  const [isReady, setIsReady] = useState(false);

  // Sync session and cookie with localStorage
  useEffect(() => {
    try {
      const savedTenantId = localStorage.getItem('saas.active_tenant_id') as TenantId;
      if (savedTenantId) {
        const foundTenant = SYSTEM_TENANTS.find((t) => t.id === savedTenantId);
        if (foundTenant) setCurrentTenant(foundTenant);
      }

      const savedRole = localStorage.getItem('saas.active_user_role') as UserRole;
      if (savedRole && ROLE_DEFINITIONS[savedRole]) {
        setCurrentRole(savedRole);
      }
    } catch {
      // LocalStorage access may fail in restricted sandboxes
    } finally {
      setIsReady(true);
    }
  }, []);

  // Set cookie for proxy inspection whenever tenant changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.cookie = `x-tenant-id=${currentTenant.id}; path=/; SameSite=Strict`;
    }
  }, [currentTenant]);

  const switchTenant = useCallback((tenantId: TenantId) => {
    const matched = SYSTEM_TENANTS.find((t) => t.id === tenantId);
    if (matched) {
      setCurrentTenant(matched);
      try {
        localStorage.setItem('saas.active_tenant_id', matched.id);
      } catch {
        // ignore
      }
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (ROLE_DEFINITIONS[role]) {
      setCurrentRole(role);
      try {
        localStorage.setItem('saas.active_user_role', role);
      } catch {
        // ignore
      }
    }
  }, []);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      const roleDef = ROLE_DEFINITIONS[currentRole];
      return roleDef ? roleDef.permissions.includes(permission) : false;
    },
    [currentRole]
  );

  const getApiHeaders = useCallback(
    (extraHeaders: Record<string, string> = {}) => {
      return {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant.id,
        'x-user-role': currentRole,
        ...extraHeaders,
      };
    },
    [currentTenant, currentRole]
  );

  // Compute active user session representation
  const user: UserSession = {
    id: currentRole === 'ORG_ADMIN' ? 'usr-adm-01' : currentRole === 'COMPLIANCE_AUDITOR' ? 'usr-aud-02' : 'usr-mem-03',
    name:
      currentRole === 'ORG_ADMIN'
        ? 'Marcus Sterling'
        : currentRole === 'COMPLIANCE_AUDITOR'
        ? 'Elena Rostova (Auditor)'
        : 'David K. Vance',
    email:
      currentRole === 'ORG_ADMIN'
        ? `m.sterling@${currentTenant.id === 't_acme_corp' ? 'acmewave.internal' : 'nexushealth.internal'}`
        : currentRole === 'COMPLIANCE_AUDITOR'
        ? 'e.rostova@thirdparty-audit.org'
        : `d.vance@${currentTenant.id === 't_acme_corp' ? 'acmewave.internal' : 'nexushealth.internal'}`,
    role: currentRole,
    tenantId: currentTenant.id,
    tenantName: currentTenant.name,
    authProvider: 'Corporate Identity Broker (SAML 2.0 / FIDO2)',
    mfaVerified: true,
    avatarText: currentRole === 'ORG_ADMIN' ? 'MS' : currentRole === 'COMPLIANCE_AUDITOR' ? 'ER' : 'DV',
    assignedRoleDescription: ROLE_DEFINITIONS[currentRole].description,
  };

  return (
    <AuthTenantContext.Provider
      value={{
        currentTenant,
        user,
        availableTenants: SYSTEM_TENANTS,
        availableRoles: ['ORG_ADMIN', 'COMPLIANCE_AUDITOR', 'MEMBER'],
        switchTenant,
        switchRole,
        hasPermission,
        getApiHeaders,
        isReady,
      }}
    >
      {children}
    </AuthTenantContext.Provider>
  );
}

export function useAuthTenant() {
  const context = useContext(AuthTenantContext);
  if (!context) {
    throw new Error('useAuthTenant must be used within an AuthTenantProvider');
  }
  return context;
}

// Aliases for backward compatibility
export const useTenant = useAuthTenant;

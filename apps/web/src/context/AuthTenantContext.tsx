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

export const CORPORATE_PERSONAS = {
  sonjoy: {
    id: 'usr-sonjoy-01',
    name: 'Sonjoy Biswas',
    title: 'Infra & Org Admin',
    email: 'sonjoy.biswas@acmewave.internal',
    role: 'ORG_ADMIN' as UserRole,
    tenantId: 't_acme_corp' as TenantId,
    tenantName: 'Acme Corporation',
    authProvider: 'Okta Enterprise SSO (SAML 2.0 / FIDO2)',
    mfaVerified: true,
    avatarText: 'SB',
    assignedRoleDescription:
      'Full administrative access across document ingestion, RLS partitions, copilot execution, and compliance telemetry.',
  },
  sarah: {
    id: 'usr-sarah-02',
    name: 'Dr. Sarah Khan',
    title: 'Compliance Officer',
    email: 'sarah.khan@acmewave.internal',
    role: 'COMPLIANCE_AUDITOR' as UserRole,
    tenantId: 't_acme_corp' as TenantId,
    tenantName: 'Acme Corporation',
    authProvider: 'Okta Enterprise SSO (SAML 2.0 / FIDO2)',
    mfaVerified: true,
    avatarText: 'SK',
    assignedRoleDescription:
      'Read-only access to PII redaction event logs, legal grounding certificates, and immutable audit trails. Ingestion and interactive query are prohibited.',
  },
  alex: {
    id: 'usr-alex-03',
    name: 'Alex Rivera',
    title: 'External Consultant',
    email: 'alex.rivera@consultant.external',
    role: 'MEMBER' as UserRole,
    tenantId: 't_nexus_health' as TenantId,
    tenantName: 'Nexus Dynamics Inc.',
    authProvider: 'Microsoft Entra ID (Federated External)',
    mfaVerified: true,
    avatarText: 'AR',
    assignedRoleDescription:
      'Standard query authorization against certified tenant policies. Restricted from viewing raw redaction telemetry or triggering document ingestion.',
  },
};

export const AVAILABLE_PERSONAS = [
  { id: 'sonjoy' as const, user: CORPORATE_PERSONAS.sonjoy, description: 'Infra & Org Admin' },
  { id: 'sarah' as const, user: CORPORATE_PERSONAS.sarah, description: 'Compliance Officer' },
  { id: 'alex' as const, user: CORPORATE_PERSONAS.alex, description: 'External Consultant' },
];

export const ROLE_DEFINITIONS: Record<
  UserRole,
  { label: string; description: string; permissions: Permission[] }
> = {
  ORG_ADMIN: {
    label: 'Organization Administrator',
    description:
      'Full administrative access across document ingestion, RLS partitions, copilot execution, and compliance telemetry.',
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
    description:
      'Read-only access to PII redaction event logs, legal grounding certificates, and immutable audit trails. Ingestion and interactive query are prohibited.',
    permissions: ['audit:read', 'audit:export'],
  },
  MEMBER: {
    label: 'Enterprise Member',
    description:
      'Standard query authorization against certified tenant policies. Restricted from viewing raw redaction telemetry or triggering document ingestion.',
    permissions: ['copilot:query'],
  },
};

interface AuthTenantContextValue {
  currentTenant: Tenant;
  user: UserSession | null;
  isAuthenticated: boolean;
  availableTenants: Tenant[];
  availableRoles: UserRole[];
  loginAsPersona: (personaKey: 'sonjoy' | 'sarah' | 'alex') => void;
  loginWithSso: (email: string, tenantId?: TenantId, role?: UserRole, name?: string) => void;
  logout: () => void;
  switchTenant: (tenantId: TenantId) => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  getApiHeaders: (extraHeaders?: Record<string, string>) => Record<string, string>;
  isReady: boolean;
}

const AuthTenantContext = createContext<AuthTenantContextValue | undefined>(undefined);

export function AuthTenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(SYSTEM_TENANTS[0]);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Restore authenticated session from cookies / localStorage
  useEffect(() => {
    try {
      // Check for sentrydocs_session cookie or localStorage
      let sessionData: UserSession | null = null;

      const storedSession = localStorage.getItem('sentrydocs_session');
      if (storedSession) {
        sessionData = JSON.parse(storedSession);
      } else if (typeof document !== 'undefined') {
        const cookies = document.cookie.split('; ');
        const foundCookie = cookies.find((c) => c.startsWith('sentrydocs_session='));
        if (foundCookie) {
          const cookieVal = decodeURIComponent(foundCookie.split('=')[1]);
          sessionData = JSON.parse(cookieVal);
        }
      }

      if (sessionData && sessionData.id) {
        setUser(sessionData);
        const matchedTenant = SYSTEM_TENANTS.find((t) => t.id === sessionData.tenantId) || SYSTEM_TENANTS[0];
        setCurrentTenant(matchedTenant);
      }
    } catch {
      // ignore JSON parse or storage restriction
    } finally {
      setIsReady(true);
    }
  }, []);

  const persistSession = useCallback((session: UserSession, tenant: Tenant) => {
    setUser(session);
    setCurrentTenant(tenant);

    try {
      localStorage.setItem('sentrydocs_session', JSON.stringify(session));
      localStorage.setItem('saas.active_tenant_id', tenant.id);
      localStorage.setItem('saas.active_user_role', session.role);
    } catch {
      // ignore
    }

    if (typeof document !== 'undefined') {
      const serialized = encodeURIComponent(JSON.stringify(session));
      document.cookie = `sentrydocs_session=${serialized}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `x-tenant-id=${tenant.id}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `x-user-role=${session.role}; path=/; max-age=86400; SameSite=Lax`;
    }
  }, []);

  const loginAsPersona = useCallback(
    (personaKey: 'sonjoy' | 'sarah' | 'alex') => {
      const persona = CORPORATE_PERSONAS[personaKey];
      if (!persona) return;

      const tenant = SYSTEM_TENANTS.find((t) => t.id === persona.tenantId) || SYSTEM_TENANTS[0];
      const session: UserSession = {
        id: persona.id,
        name: persona.name,
        email: persona.email,
        role: persona.role,
        tenantId: persona.tenantId,
        tenantName: persona.tenantName,
        authProvider: persona.authProvider,
        mfaVerified: persona.mfaVerified,
        avatarText: persona.avatarText,
        assignedRoleDescription: persona.assignedRoleDescription,
      };

      persistSession(session, tenant);
    },
    [persistSession]
  );

  const loginWithSso = useCallback(
    (email: string, tenantId: TenantId = 't_acme_corp', role: UserRole = 'MEMBER', name?: string) => {
      const tenant = SYSTEM_TENANTS.find((t) => t.id === tenantId) || SYSTEM_TENANTS[0];
      const initials = name
        ? name
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : email.slice(0, 2).toUpperCase();

      const session: UserSession = {
        id: `usr-sso-${Date.now()}`,
        name: name || email.split('@')[0].replace('.', ' '),
        email,
        role,
        tenantId: tenant.id,
        tenantName: tenant.name,
        authProvider: 'Okta SAML 2.0 (SSO Federated)',
        mfaVerified: true,
        avatarText: initials || 'ID',
        assignedRoleDescription: ROLE_DEFINITIONS[role].description,
      };

      persistSession(session, tenant);
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('sentrydocs_session');
      localStorage.removeItem('saas.active_tenant_id');
      localStorage.removeItem('saas.active_user_role');
    } catch {
      // ignore
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'sentrydocs_session=; path=/; max-age=0';
      document.cookie = 'x-tenant-id=; path=/; max-age=0';
      document.cookie = 'x-user-role=; path=/; max-age=0';
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const switchTenant = useCallback(
    (tenantId: TenantId) => {
      const matched = SYSTEM_TENANTS.find((t) => t.id === tenantId);
      if (matched) {
        setCurrentTenant(matched);
        if (user) {
          const updatedUser = { ...user, tenantId: matched.id, tenantName: matched.name };
          persistSession(updatedUser, matched);
        }
      }
    },
    [user, persistSession]
  );

  const switchRole = useCallback(
    (role: UserRole) => {
      if (ROLE_DEFINITIONS[role] && user) {
        const updatedUser = {
          ...user,
          role,
          assignedRoleDescription: ROLE_DEFINITIONS[role].description,
        };
        persistSession(updatedUser, currentTenant);
      }
    },
    [user, currentTenant, persistSession]
  );

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      const roleDef = ROLE_DEFINITIONS[user.role];
      return roleDef ? roleDef.permissions.includes(permission) : false;
    },
    [user]
  );

  const getApiHeaders = useCallback(
    (extraHeaders: Record<string, string> = {}) => {
      return {
        'Content-Type': 'application/json',
        'x-tenant-id': currentTenant.id,
        'x-user-role': user ? user.role : 'MEMBER',
        ...extraHeaders,
      };
    },
    [currentTenant, user]
  );

  return (
    <AuthTenantContext.Provider
      value={{
        currentTenant,
        user,
        isAuthenticated: Boolean(user),
        availableTenants: SYSTEM_TENANTS,
        availableRoles: ['ORG_ADMIN', 'COMPLIANCE_AUDITOR', 'MEMBER'],
        loginAsPersona,
        loginWithSso,
        logout,
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

export const useTenant = useAuthTenant;

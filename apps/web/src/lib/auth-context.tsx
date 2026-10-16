'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SYSTEM_TENANTS } from './tenant-context';
import { Tenant } from '../types';

export type UserRole = 'SECURITY_ADMIN' | 'COMPLIANCE_OFFICER' | 'AUDITOR' | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  authProvider: string;
  avatarText: string;
  mfaVerified: boolean;
  canSwitchTenant: boolean;
  department: string;
}

export const PRESET_USERS: Record<'acme' | 'nexus' | 'auditor', AuthUser> = {
  acme: {
    id: 'usr-acme-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acme.com',
    role: 'SECURITY_ADMIN',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    tenantName: 'Acme Corporation',
    authProvider: 'Okta SAML 2.0 (SSO)',
    avatarText: 'SJ',
    mfaVerified: true,
    canSwitchTenant: false, // Strict Single-Tenant Locked Session
    department: 'Corporate Security & Compliance',
  },
  nexus: {
    id: 'usr-nexus-002',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@nexusdynamics.com',
    role: 'COMPLIANCE_OFFICER',
    tenantId: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    tenantName: 'Nexus Dynamics Inc.',
    authProvider: 'Microsoft Entra ID (Azure AD)',
    avatarText: 'MV',
    mfaVerified: true,
    canSwitchTenant: false, // Strict Single-Tenant Locked Session
    department: 'HIPAA & Clinical Data Governance',
  },
  auditor: {
    id: 'usr-audit-003',
    name: 'Elena Rostova',
    email: 'e.rostova@kpmg-audit.com',
    role: 'AUDITOR',
    tenantId: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    tenantName: 'Acme Corporation (Auditor Session)',
    authProvider: 'KPMG Global Identity (FIDO2 MFA)',
    avatarText: 'ER',
    mfaVerified: true,
    canSwitchTenant: true, // Cross-Tenant Attestation Permission
    department: 'Third-Party SOC 2 / HIPAA Attestation Team',
  },
};

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginAs: (presetKey: 'acme' | 'nexus' | 'auditor') => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('app.auth_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = (presetKey: 'acme' | 'nexus' | 'auditor') => {
    const selected = PRESET_USERS[presetKey];
    setUser(selected);
    try {
      localStorage.setItem('app.auth_session', JSON.stringify(selected));
      localStorage.setItem('app.active_tenant_id', selected.tenantId);
    } catch {
      // ignore
    }
  };

  const loginWithEmail = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const domain = cleanEmail.split('@')[1] || '';

    let matchedTenant: Tenant | undefined = SYSTEM_TENANTS.find((t) =>
      t.name.toLowerCase().includes(domain.split('.')[0])
    );

    // Acme detection
    if (domain.includes('acme') || domain.includes('corporation')) {
      matchedTenant = SYSTEM_TENANTS[0];
    } else if (domain.includes('nexus') || domain.includes('health')) {
      matchedTenant = SYSTEM_TENANTS[1];
    }

    if (!matchedTenant) {
      // Check custom tenants
      try {
        const customStr = localStorage.getItem('app.custom_tenants');
        if (customStr) {
          const parsed = JSON.parse(customStr);
          if (Array.isArray(parsed)) {
            matchedTenant = parsed.find((t: Tenant) =>
              t.name.toLowerCase().includes(domain.split('.')[0])
            );
          }
        }
      } catch {
        // ignore
      }
    }

    // Fallback to Acme Corporation if unknown
    const activeTenant = matchedTenant || SYSTEM_TENANTS[0];
    const displayName = name?.trim() || cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      role: 'EMPLOYEE',
      tenantId: activeTenant.id,
      tenantName: activeTenant.name,
      authProvider: 'Corporate SAML 2.0 (SSO)',
      avatarText: initials || 'ID',
      mfaVerified: true,
      canSwitchTenant: false,
      department: `${activeTenant.name} Operations`,
    };

    setUser(newUser);
    try {
      localStorage.setItem('app.auth_session', JSON.stringify(newUser));
      localStorage.setItem('app.active_tenant_id', activeTenant.id);
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('app.auth_session');
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginAs,
        loginWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

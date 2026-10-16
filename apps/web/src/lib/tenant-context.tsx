'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';

export const SYSTEM_TENANTS: Tenant[] = [
  {
    id: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    name: 'Acme Corporation',
    code: 'ACME_GLOBAL',
    plan: 'ENTERPRISE_SOC2',
    complianceTags: ['SOC 2 Type II', 'Zero-Egress Vault', 'Dedicated Partition'],
  },
  {
    id: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    name: 'Nexus Dynamics Inc.',
    code: 'NEXUS_HEALTH',
    plan: 'FINANCIAL_HIPAA',
    complianceTags: ['HIPAA & HITECH', 'ePHI Guarded', 'Dedicated Partition'],
  },
];

interface TenantContextValue {
  currentTenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  availableTenants: Tenant[];
  getApiHeaders: (extraHeaders?: Record<string, string>) => Record<string, string>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(SYSTEM_TENANTS[0]);

  useEffect(() => {
    try {
      const savedId = localStorage.getItem('app.active_tenant_id');
      if (savedId) {
        const found = SYSTEM_TENANTS.find((t) => t.id === savedId);
        if (found) setCurrentTenant(found);
      }
    } catch {
      // LocalStorage access may fail in restricted iframes
    }
  }, []);

  const handleSetTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    try {
      localStorage.setItem('app.active_tenant_id', tenant.id);
    } catch {
      // ignore
    }
  };

  const getApiHeaders = (extraHeaders: Record<string, string> = {}) => {
    return {
      'Content-Type': 'application/json',
      'x-tenant-id': currentTenant.id,
      ...extraHeaders,
    };
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setTenant: handleSetTenant,
        availableTenants: SYSTEM_TENANTS,
        getApiHeaders,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

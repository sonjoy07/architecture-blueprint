'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '../types';

export const ENTERPRISE_TENANTS: Tenant[] = [
  {
    id: 'c4b3a88a-21e1-4c48-8df0-9f5b611e92d8',
    name: 'Acme Global Holdings',
    plan: 'ENTERPRISE_SOC2',
    complianceTags: ['SOC 2 Type II', 'ISO 27001', 'RLS Enforced'],
  },
  {
    id: '7e2b10a9-3d12-4211-a89e-4a6c8e3100f2',
    name: 'Sovereign Health Systems',
    plan: 'FINANCIAL_HIPAA',
    complianceTags: ['HIPAA BAA', 'ePHI Boundary', 'Zero Egress'],
  },
  {
    id: '9a1023bc-6f44-482a-b731-29d91f4211a7',
    name: 'Globex Financial Corp',
    plan: 'GOV_CLOUD',
    complianceTags: ['FedRAMP Moderate', 'CMEK KMS', 'Strict Isolation'],
  },
];

interface TenantContextType {
  currentTenant: Tenant;
  setTenant: (tenant: Tenant) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant>(ENTERPRISE_TENANTS[0]);

  // Sync to localStorage for persistent testing
  useEffect(() => {
    const saved = localStorage.getItem('app.active_tenant_id');
    if (saved) {
      const match = ENTERPRISE_TENANTS.find((t) => t.id === saved);
      if (match) setCurrentTenant(match);
    }
  }, []);

  const handleSetTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    localStorage.setItem('app.active_tenant_id', tenant.id);
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        setTenant: handleSetTenant,
        availableTenants: ENTERPRISE_TENANTS,
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

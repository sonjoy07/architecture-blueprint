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
  addTenant: (tenant: Omit<Tenant, 'id'> & { id?: string }) => Tenant;
  deleteTenant: (id: string) => void;
  getApiHeaders: (extraHeaders?: Record<string, string>) => Record<string, string>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(SYSTEM_TENANTS);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(SYSTEM_TENANTS[0]);

  useEffect(() => {
    try {
      let combinedTenants = [...SYSTEM_TENANTS];
      const customStr = localStorage.getItem('app.custom_tenants');
      if (customStr) {
        const parsed = JSON.parse(customStr);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(SYSTEM_TENANTS.map((t) => t.id));
          const uniqueCustom = parsed.filter((t: Tenant) => !existingIds.has(t.id));
          combinedTenants = [...SYSTEM_TENANTS, ...uniqueCustom];
          setTenants(combinedTenants);
        }
      }

      const savedId = localStorage.getItem('app.active_tenant_id');
      if (savedId) {
        const found = combinedTenants.find((t) => t.id === savedId);
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

  const addTenant = (newTenantData: Omit<Tenant, 'id'> & { id?: string }): Tenant => {
    const id =
      newTenantData.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'ws-' + Math.random().toString(36).substring(2, 10));

    const newTenant: Tenant = {
      ...newTenantData,
      id,
    };

    const updated = [...tenants, newTenant];
    setTenants(updated);
    setCurrentTenant(newTenant);

    try {
      const customOnly = updated.filter(
        (t) => !SYSTEM_TENANTS.some((sys) => sys.id === t.id)
      );
      localStorage.setItem('app.custom_tenants', JSON.stringify(customOnly));
      localStorage.setItem('app.active_tenant_id', id);
    } catch {
      // ignore
    }

    return newTenant;
  };

  const deleteTenant = (id: string) => {
    const isSystem = SYSTEM_TENANTS.some((t) => t.id === id);
    if (isSystem) return;

    const updated = tenants.filter((t) => t.id !== id);
    setTenants(updated);

    try {
      const customOnly = updated.filter(
        (t) => !SYSTEM_TENANTS.some((sys) => sys.id === t.id)
      );
      localStorage.setItem('app.custom_tenants', JSON.stringify(customOnly));
      if (currentTenant.id === id) {
        handleSetTenant(SYSTEM_TENANTS[0]);
      }
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
        availableTenants: tenants,
        addTenant,
        deleteTenant,
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

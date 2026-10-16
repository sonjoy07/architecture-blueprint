import './globals.css';
import type { Metadata } from 'next';
import { AuthTenantProvider } from '../context/AuthTenantContext';
import { TenantProvider } from '../lib/tenant-context';
import { AuthProvider } from '../lib/auth-context';

export const metadata: Metadata = {
  title: 'LexiGuard B2B Console | Enterprise Multi-Tenant AI & Compliance Platform',
  description: 'Industrial SaaS Console with Strict RLS Partitioning, Zero-Egress PII Scrubbing, and Verifiable Citation Telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark bg-slate-950 text-slate-100">
      <body className="antialiased bg-slate-950 text-slate-200 selection:bg-cyan-500 selection:text-slate-950 min-h-screen">
        <AuthTenantProvider>
          <AuthProvider>
            <TenantProvider>{children}</TenantProvider>
          </AuthProvider>
        </AuthTenantProvider>
      </body>
    </html>
  );
}

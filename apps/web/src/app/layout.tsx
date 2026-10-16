import './globals.css';
import type { Metadata } from 'next';
import { TenantProvider } from '../lib/tenant-context';

export const metadata: Metadata = {
  title: 'LexiGuard Copilot | Enterprise AI Policy & Compliance Intelligence',
  description: 'SOC 2 Type II Certified Enterprise Knowledge Copilot with Zero-Egress Perimeter Guardrails and Cryptographic Single-Tenant Isolation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}

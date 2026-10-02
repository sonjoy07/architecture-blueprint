import './globals.css';
import type { Metadata } from 'next';
import { TenantProvider } from '../lib/tenant-context';

export const metadata: Metadata = {
  title: 'Multi-Tenant Enterprise Document & Policy Knowledge Copilot',
  description: 'Enterprise Policy Copilot with pgvector RLS and Real-time Citation Verification',
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

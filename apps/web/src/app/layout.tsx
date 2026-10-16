import './globals.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { AuthTenantProvider } from '../context/AuthTenantContext';
import { TenantProvider } from '../lib/tenant-context';
import { AuthProvider } from '../lib/auth-context';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LexiGuard Console | Enterprise Policy & Compliance Workstation',
  description:
    'Industrial SaaS Workstation with Strict RLS Partitioning, Zero-Egress PII Scrubbing, and Verifiable Citation Telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`light ${plexSans.variable} ${plexMono.variable} bg-[#F8FAFC] text-[#0F172A]`}
    >
      <body className="antialiased bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB]/20 selection:text-[#0F172A] min-h-screen font-sans">
        <AuthTenantProvider>
          <AuthProvider>
            <TenantProvider>{children}</TenantProvider>
          </AuthProvider>
        </AuthTenantProvider>
      </body>
    </html>
  );
}

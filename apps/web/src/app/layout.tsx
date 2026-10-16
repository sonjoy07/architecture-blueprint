import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthTenantProvider } from '../context/AuthTenantContext';
import { TenantProvider } from '../lib/tenant-context';
import { AuthProvider } from '../lib/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
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
      className={`light ${inter.variable} ${jetbrainsMono.variable} bg-[#F8FAFC] text-[#0F172A]`}
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

import { Navbar } from '../../components/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

import { Header } from '../../components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

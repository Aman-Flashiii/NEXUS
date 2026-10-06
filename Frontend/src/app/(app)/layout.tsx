import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1">
        <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

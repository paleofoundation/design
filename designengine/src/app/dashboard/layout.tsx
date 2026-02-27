import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm">
              DE
            </div>
            <span className="font-semibold text-lg">DesignEngine</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-white transition">
              Overview
            </Link>
            <Link href="/dashboard/keys" className="hover:text-white transition">
              API Keys
            </Link>
            <Link href="/dashboard/usage" className="hover:text-white transition">
              Usage
            </Link>
            <Link href="/dashboard/playground" className="hover:text-white transition">
              Playground
            </Link>
            <Link href="/dashboard/billing" className="hover:text-white transition">
              Billing
            </Link>
          </div>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

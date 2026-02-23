import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SidebarNav from '@/components/SidebarNav';

function LogOutIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0c0c0f] border-r border-zinc-800/50 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center">
            <Image src="/logo-white.png" alt="SmithKit" width={160} height={45} className="h-9 w-auto" />
          </Link>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User */}
        <div className="p-4 border-t border-zinc-800/50 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-900/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white text-sm font-semibold">
              {profile?.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.name || user.email}
              </p>
              <p className="text-xs text-zinc-500 truncate">Free plan</p>
            </div>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="text-zinc-500 hover:text-white transition-colors p-1">
                <LogOutIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[#09090b]">
        {children}
      </main>
    </div>
  );
}

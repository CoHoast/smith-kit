import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-red-600/20 via-orange-600/10 to-yellow-600/20 border-b border-red-500/20 px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wider">
              Admin Mode
            </span>
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard/admin" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Overview
              </Link>
              <Link 
                href="/dashboard/admin/users" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Users
              </Link>
              <Link 
                href="/dashboard/admin/analytics" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Analytics
              </Link>
              <Link 
                href="/dashboard/admin/support" 
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Support
              </Link>
            </nav>
          </div>
          <Link 
            href="/dashboard" 
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            ← Exit Admin
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      {children}
    </div>
  );
}

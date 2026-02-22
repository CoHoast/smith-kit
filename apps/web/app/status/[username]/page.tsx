import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicStatusPage({ params }: PageProps) {
  const { username } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Find user by github_username or email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, github_username')
    .or(`github_username.eq.${username},email.ilike.${username}%`)
    .single();

  if (!profile) {
    notFound();
  }

  // Get user's public monitors
  const { data: monitors } = await supabase
    .from('uptime_monitors')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('name');

  // Get recent checks for each monitor (last 24 hours)
  const monitorIds = monitors?.map(m => m.id) || [];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: checks } = await supabase
    .from('uptime_checks')
    .select('*')
    .in('monitor_id', monitorIds)
    .gte('checked_at', yesterday)
    .order('checked_at', { ascending: false });

  // Calculate stats per monitor
  const monitorStats = monitors?.map(monitor => {
    const monitorChecks = checks?.filter(c => c.monitor_id === monitor.id) || [];
    const upChecks = monitorChecks.filter(c => c.status === 'up').length;
    const totalChecks = monitorChecks.length;
    const uptimePercent = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 100) : 100;
    const avgResponseTime = totalChecks > 0
      ? Math.round(monitorChecks.reduce((sum, c) => sum + (c.response_time_ms || 0), 0) / totalChecks)
      : 0;
    
    // Get last 30 checks for the mini chart
    const recentChecks = monitorChecks.slice(0, 30).reverse();
    
    return {
      ...monitor,
      uptimePercent,
      avgResponseTime,
      recentChecks,
    };
  }) || [];

  // Overall status
  const allUp = monitorStats.every(m => m.current_status === 'up');
  const anyDown = monitorStats.some(m => m.current_status === 'down');
  const overallStatus = anyDown ? 'down' : allUp ? 'up' : 'degraded';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {profile.full_name || profile.github_username || 'Status'}
              </h1>
              <p className="text-[#6b6b80]">System Status</p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              overallStatus === 'up' ? 'bg-green-500/10 text-green-500' :
              overallStatus === 'down' ? 'bg-red-500/10 text-red-500' :
              'bg-yellow-500/10 text-yellow-500'
            }`}>
              {overallStatus === 'up' ? '✓ All Systems Operational' :
               overallStatus === 'down' ? '✕ System Outage' :
               '◐ Partial Outage'}
            </div>
          </div>
        </div>
      </header>

      {/* Monitors */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {!monitorStats || monitorStats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b80]">No monitors configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitorStats.map((monitor) => (
              <div
                key={monitor.id}
                className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      monitor.current_status === 'up' ? 'bg-green-500' :
                      monitor.current_status === 'down' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-white">{monitor.name}</h3>
                      <p className="text-sm text-[#6b6b80]">{monitor.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      monitor.current_status === 'up' ? 'text-green-500' :
                      monitor.current_status === 'down' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {monitor.current_status === 'up' ? 'Operational' :
                       monitor.current_status === 'down' ? 'Down' : 'Degraded'}
                    </p>
                    <p className="text-sm text-[#6b6b80]">{monitor.uptimePercent}% uptime</p>
                  </div>
                </div>

                {/* Response Time Mini Chart */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#6b6b80] mb-2">
                    <span>Last 30 checks</span>
                    <span>Avg: {monitor.avgResponseTime}ms</span>
                  </div>
                  <div className="flex gap-0.5 h-8">
                    {monitor.recentChecks.map((check: { id: string; status: string; response_time_ms: number }, i: number) => (
                      <div
                        key={check.id || i}
                        className={`flex-1 rounded-sm ${
                          check.status === 'up' ? 'bg-green-500/30' :
                          check.status === 'down' ? 'bg-red-500/30' :
                          'bg-yellow-500/30'
                        }`}
                        style={{
                          height: `${Math.min(100, Math.max(20, (check.response_time_ms || 0) / 10))}%`,
                          alignSelf: 'flex-end'
                        }}
                        title={`${check.response_time_ms}ms`}
                      />
                    ))}
                    {/* Fill empty slots */}
                    {Array.from({ length: Math.max(0, 30 - monitor.recentChecks.length) }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex-1 rounded-sm bg-[#1e1e2e]"
                        style={{ height: '20%', alignSelf: 'flex-end' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1e1e2e] flex items-center justify-between">
          <p className="text-sm text-[#6b6b80]">
            Powered by{' '}
            <Link href="https://smithkit.ai" className="text-[#6366f1] hover:underline">
              SmithKit
            </Link>
          </p>
          <p className="text-sm text-[#6b6b80]">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  return {
    title: `${username} Status — SmithKit`,
    description: `System status and uptime for ${username}`,
  };
}

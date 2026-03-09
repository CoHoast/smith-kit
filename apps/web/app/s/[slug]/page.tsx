import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicStatusPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get status page by slug
  const { data: statusPage } = await supabase
    .from('status_pages')
    .select(`
      *,
      status_page_monitors (
        display_name,
        display_order,
        monitor:uptime_monitors (
          id,
          name,
          url,
          current_status,
          last_checked_at
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (!statusPage) {
    notFound();
  }

  // Get recent incidents for this status page
  const { data: incidents } = await supabase
    .from('incidents')
    .select(`
      *,
      incident_updates (
        id,
        status,
        message,
        created_at
      )
    `)
    .eq('status_page_id', statusPage.id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get checks for each monitor (last 24 hours)
  const monitorIds = statusPage.status_page_monitors?.map((m: { monitor: { id: string } }) => m.monitor?.id).filter(Boolean) || [];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: checks } = await supabase
    .from('uptime_checks')
    .select('*')
    .in('monitor_id', monitorIds)
    .gte('checked_at', yesterday)
    .order('checked_at', { ascending: false });

  // Calculate stats per monitor
  const monitors = statusPage.status_page_monitors
    ?.sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)
    .map((spm: { display_name: string; monitor: { id: string; name: string; url: string; current_status: string } }) => {
      const monitor = spm.monitor;
      if (!monitor) return null;
      
      const monitorChecks = checks?.filter((c: { monitor_id: string }) => c.monitor_id === monitor.id) || [];
      const upChecks = monitorChecks.filter((c: { status: string }) => c.status === 'up').length;
      const totalChecks = monitorChecks.length;
      const uptimePercent = totalChecks > 0 ? Math.round((upChecks / totalChecks) * 100) : 100;
      const avgResponseTime = totalChecks > 0
        ? Math.round(monitorChecks.reduce((sum: number, c: { response_time_ms: number }) => sum + (c.response_time_ms || 0), 0) / totalChecks)
        : 0;
      
      const recentChecks = monitorChecks.slice(0, 30).reverse();
      
      return {
        ...monitor,
        displayName: spm.display_name || monitor.name,
        uptimePercent,
        avgResponseTime,
        recentChecks,
      };
    })
    .filter(Boolean) || [];

  // Overall status
  const anyDown = monitors.some((m: { current_status: string }) => m.current_status === 'down');
  const allUp = monitors.every((m: { current_status: string }) => m.current_status === 'up');
  const overallStatus = anyDown ? 'down' : allUp ? 'up' : 'degraded';

  // Active incidents
  const activeIncidents = incidents?.filter((i: { status: string }) => i.status !== 'resolved') || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e2e]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {statusPage.logo_url && (
                <img src={statusPage.logo_url} alt="" className="w-10 h-10 rounded-lg" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {statusPage.name}
                </h1>
                {statusPage.description && (
                  <p className="text-[#6b6b80]">{statusPage.description}</p>
                )}
              </div>
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Active Incidents Banner */}
        {activeIncidents.length > 0 && (
          <div className="mb-8 space-y-4">
            {activeIncidents.map((incident: { id: string; title: string; status: string; severity: string; incident_updates: { id: string; message: string; created_at: string }[] }) => (
              <div
                key={incident.id}
                className={`p-4 rounded-xl border ${
                  incident.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  incident.severity === 'major' ? 'bg-orange-500/10 border-orange-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                    incident.status === 'investigating' ? 'bg-red-500/20 text-red-400' :
                    incident.status === 'identified' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {incident.status}
                  </span>
                  <h3 className="font-semibold text-white">{incident.title}</h3>
                </div>
                {incident.incident_updates?.[0] && (
                  <p className="text-[#a1a1aa] text-sm">
                    {incident.incident_updates[0].message}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Monitors */}
        {monitors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#6b6b80]">No monitors configured yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {monitors.map((monitor: { id: string; displayName: string; url: string; current_status: string; uptimePercent: number; avgResponseTime: number; recentChecks: { id: string; status: string; response_time_ms: number }[] }) => (
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
                      <h3 className="font-semibold text-white">{monitor.displayName}</h3>
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

                {/* Response Time Chart */}
                {statusPage.show_uptime_chart && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[#6b6b80] mb-2">
                      <span>Last 30 checks</span>
                      {statusPage.show_response_times && <span>Avg: {monitor.avgResponseTime}ms</span>}
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
                      {Array.from({ length: Math.max(0, 30 - monitor.recentChecks.length) }).map((_, i) => (
                        <div
                          key={`empty-${i}`}
                          className="flex-1 rounded-sm bg-[#1e1e2e]"
                          style={{ height: '20%', alignSelf: 'flex-end' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Incident History */}
        {incidents && incidents.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Incident History</h2>
            <div className="space-y-4">
              {incidents.filter((i: { status: string }) => i.status === 'resolved').slice(0, 5).map((incident: { id: string; title: string; started_at: string; resolved_at: string; incident_updates: { id: string; status: string; message: string; created_at: string }[] }) => (
                <div key={incident.id} className="p-4 rounded-xl bg-[#12121a] border border-[#1e1e2e]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{incident.title}</h3>
                    <span className="text-sm text-[#6b6b80]">
                      {new Date(incident.started_at).toLocaleDateString()}
                    </span>
                  </div>
                  {incident.incident_updates?.slice(-1)[0] && (
                    <p className="text-sm text-[#a1a1aa]">
                      {incident.incident_updates.slice(-1)[0].message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[#1e1e2e] flex items-center justify-between">
          <p className="text-sm text-[#6b6b80]">
            Powered by{' '}
            <Link href="https://smithkit.ai" className="text-[#6366f1] hover:underline">
              SmithKit StatusKit
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
  const { slug } = await params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: statusPage } = await supabase
    .from('status_pages')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  return {
    title: statusPage ? `${statusPage.name} Status` : 'Status Page',
    description: statusPage?.description || 'System status and uptime',
  };
}

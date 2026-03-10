'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SpeedKitUrl {
  id: string;
  url: string;
  name: string;
  scan_frequency: string;
  alert_threshold: number;
  is_active: boolean;
  last_scanned_at: string | null;
  created_at: string;
  latest_desktop?: {
    performance_score: number;
    accessibility_score: number;
    best_practices_score: number;
    seo_score: number;
    lcp_ms: number;
    fid_ms: number;
    cls: number;
    scanned_at: string;
  } | null;
  latest_mobile?: {
    performance_score: number;
    accessibility_score: number;
    best_practices_score: number;
    seo_score: number;
    lcp_ms: number;
    fid_ms: number;
    cls: number;
    scanned_at: string;
  } | null;
}

interface ScanResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
}

export default function SpeedKitPage() {
  const [urls, setUrls] = useState<SpeedKitUrl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickScan, setShowQuickScan] = useState(false);
  const [newUrl, setNewUrl] = useState({ url: '', name: '' });
  const [quickScanUrl, setQuickScanUrl] = useState('');
  const [quickScanResults, setQuickScanResults] = useState<{ desktop?: ScanResult | null; mobile?: ScanResult | null } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningUrlId, setScanningUrlId] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    avgDesktopScore: null as number | null,
    avgMobileScore: null as number | null,
    urlsNeedingAttention: 0,
  });

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      const res = await fetch('/api/speedkit/summary');
      const data = await res.json();
      
      if (data.urls) {
        setUrls(data.urls);
        setSummary({
          avgDesktopScore: data.avgDesktopScore,
          avgMobileScore: data.avgMobileScore,
          urlsNeedingAttention: data.urlsNeedingAttention,
        });
      }
    } catch (error) {
      console.error('Failed to load URLs:', error);
    }
    setIsLoading(false);
  };

  const addUrl = async () => {
    if (!newUrl.url) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/speedkit/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUrl),
      });

      if (res.ok) {
        const data = await res.json();
        setShowAddModal(false);
        setNewUrl({ url: '', name: '' });
        
        // Trigger initial scan
        if (data.url?.id) {
          await runScan(data.url.id);
        }
        
        loadUrls();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to add URL');
      }
    } catch (error) {
      console.error('Failed to add URL:', error);
      alert('Failed to add URL');
    }
    setIsSaving(false);
  };

  const deleteUrl = async (id: string) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    try {
      await fetch(`/api/speedkit/urls?id=${id}`, { method: 'DELETE' });
      loadUrls();
    } catch (error) {
      console.error('Failed to delete URL:', error);
    }
  };

  const runScan = async (urlId: string) => {
    setScanningUrlId(urlId);
    try {
      await fetch('/api/speedkit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: urlId, device: 'both' }),
      });
      loadUrls();
    } catch (error) {
      console.error('Failed to run scan:', error);
    }
    setScanningUrlId(null);
  };

  const runQuickScan = async () => {
    if (!quickScanUrl) return;
    setIsScanning(true);
    setQuickScanResults(null);

    try {
      const res = await fetch('/api/speedkit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: quickScanUrl, device: 'both' }),
      });

      const data = await res.json();
      setQuickScanResults({
        desktop: data.desktop,
        mobile: data.mobile,
      });
    } catch (error) {
      console.error('Failed to run quick scan:', error);
      alert('Failed to run scan');
    }
    setIsScanning(false);
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-gray-500';
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-gray-500/20';
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 50) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const formatTime = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  };

  const getCWVStatus = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    };

    const t = thresholds[metric];
    if (!t) return 'text-gray-500';
    if (value <= t.good) return 'text-green-500';
    if (value <= t.poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">SpeedKit</h1>
          <p className="text-[#a1a1b5]">Track Lighthouse scores and Core Web Vitals over time</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowQuickScan(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium text-sm hover:bg-[#1a1a25] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Quick Scan
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add URL
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {urls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <p className="text-[#6b6b80] text-sm mb-1">Avg Desktop Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(summary.avgDesktopScore)}`}>
              {summary.avgDesktopScore ?? '—'}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <p className="text-[#6b6b80] text-sm mb-1">Avg Mobile Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(summary.avgMobileScore)}`}>
              {summary.avgMobileScore ?? '—'}
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <p className="text-[#6b6b80] text-sm mb-1">URLs Needing Attention</p>
            <p className={`text-3xl font-bold ${summary.urlsNeedingAttention > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {summary.urlsNeedingAttention}
            </p>
          </div>
        </div>
      )}

      {/* URL List */}
      {urls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No URLs monitored yet</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Add a URL to start tracking performance scores and Core Web Vitals.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Your First URL
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {urls.map((url) => (
            <div
              key={url.id}
              className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] hover:border-[#2e2e3e] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Link href={`/dashboard/speedkit/${url.id}`} className="hover:underline">
                    <h3 className="font-bold text-white">{url.name}</h3>
                  </Link>
                  <p className="text-sm text-[#6b6b80]">{url.url}</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Desktop Score */}
                  <div className="text-center px-4">
                    <div className={`text-2xl font-bold ${getScoreColor(url.latest_desktop?.performance_score)}`}>
                      {url.latest_desktop?.performance_score ?? '—'}
                    </div>
                    <p className="text-xs text-[#6b6b80]">Desktop</p>
                  </div>

                  {/* Mobile Score */}
                  <div className="text-center px-4 border-l border-[#1e1e2e]">
                    <div className={`text-2xl font-bold ${getScoreColor(url.latest_mobile?.performance_score)}`}>
                      {url.latest_mobile?.performance_score ?? '—'}
                    </div>
                    <p className="text-xs text-[#6b6b80]">Mobile</p>
                  </div>

                  {/* Last Scanned */}
                  <div className="text-center px-4 border-l border-[#1e1e2e]">
                    <p className="text-sm text-[#a1a1b5]">
                      {url.last_scanned_at
                        ? new Date(url.last_scanned_at).toLocaleDateString()
                        : 'Never'}
                    </p>
                    <p className="text-xs text-[#6b6b80]">Last scan</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pl-4 border-l border-[#1e1e2e]">
                    <button
                      onClick={() => runScan(url.id)}
                      disabled={scanningUrlId === url.id}
                      className="p-2 text-[#6b6b80] hover:text-[#6366f1] transition-colors disabled:opacity-50"
                      title="Run scan"
                    >
                      {scanningUrlId === url.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-[#6366f1] border-t-transparent" />
                      ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                      )}
                    </button>
                    <Link
                      href={`/dashboard/speedkit/${url.id}`}
                      className="p-2 text-[#6b6b80] hover:text-white transition-colors"
                      title="View details"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => deleteUrl(url.id)}
                      className="p-2 text-[#6b6b80] hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Core Web Vitals Row */}
              {(url.latest_desktop || url.latest_mobile) && (
                <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
                  <div className="flex items-center gap-8 text-sm">
                    <span className="text-[#6b6b80]">Core Web Vitals:</span>
                    
                    {/* LCP */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#6b6b80]">LCP</span>
                      <span className={getCWVStatus('lcp', url.latest_desktop?.lcp_ms || url.latest_mobile?.lcp_ms || 0)}>
                        {formatTime(url.latest_desktop?.lcp_ms || url.latest_mobile?.lcp_ms || 0)}
                      </span>
                    </div>

                    {/* FID */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#6b6b80]">FID</span>
                      <span className={getCWVStatus('fid', url.latest_desktop?.fid_ms || url.latest_mobile?.fid_ms || 0)}>
                        {formatTime(url.latest_desktop?.fid_ms || url.latest_mobile?.fid_ms || 0)}
                      </span>
                    </div>

                    {/* CLS */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#6b6b80]">CLS</span>
                      <span className={getCWVStatus('cls', url.latest_desktop?.cls || url.latest_mobile?.cls || 0)}>
                        {(url.latest_desktop?.cls || url.latest_mobile?.cls || 0).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add URL Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Add URL to Monitor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">URL</label>
                <input
                  type="url"
                  value={newUrl.url}
                  onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#a1a1b5] mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={newUrl.name}
                  onChange={(e) => setNewUrl({ ...newUrl, name: e.target.value })}
                  placeholder="My Website"
                  className="w-full px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addUrl}
                disabled={isSaving || !newUrl.url}
                className="flex-1 px-4 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Adding...' : 'Add & Scan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Scan Modal */}
      {showQuickScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12121a] border border-[#27272a] rounded-2xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Quick Scan</h2>
            <p className="text-[#6b6b80] text-sm mb-4">Test any URL without adding it to monitoring</p>
            
            <div className="flex gap-3 mb-6">
              <input
                type="url"
                value={quickScanUrl}
                onChange={(e) => setQuickScanUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 rounded-xl bg-[#0a0a0f] border border-[#27272a] text-white placeholder-[#6b6b80] focus:border-[#6366f1] focus:outline-none"
              />
              <button
                onClick={runQuickScan}
                disabled={isScanning || !quickScanUrl}
                className="px-6 py-3 rounded-xl bg-[#6366f1] text-white font-medium hover:bg-[#5558e3] transition-colors disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>

            {isScanning && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1] mx-auto mb-4"></div>
                  <p className="text-[#a1a1b5]">Running Lighthouse scan...</p>
                  <p className="text-[#6b6b80] text-sm">This may take 10-30 seconds</p>
                </div>
              </div>
            )}

            {quickScanResults && (
              <div className="grid grid-cols-2 gap-6">
                {/* Desktop Results */}
                {quickScanResults.desktop && (
                  <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      Desktop
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.desktop.performanceScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Performance</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.desktop.performanceScore)}`}>
                          {quickScanResults.desktop.performanceScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.desktop.accessibilityScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Accessibility</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.desktop.accessibilityScore)}`}>
                          {quickScanResults.desktop.accessibilityScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.desktop.bestPracticesScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Best Practices</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.desktop.bestPracticesScore)}`}>
                          {quickScanResults.desktop.bestPracticesScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.desktop.seoScore)}`}>
                        <p className="text-xs text-[#6b6b80]">SEO</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.desktop.seoScore)}`}>
                          {quickScanResults.desktop.seoScore}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
                      <p className="text-xs text-[#6b6b80] mb-2">Core Web Vitals</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">LCP</span>
                          <span className={getCWVStatus('lcp', quickScanResults.desktop.coreWebVitals.lcp)}>
                            {formatTime(quickScanResults.desktop.coreWebVitals.lcp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">FID</span>
                          <span className={getCWVStatus('fid', quickScanResults.desktop.coreWebVitals.fid)}>
                            {formatTime(quickScanResults.desktop.coreWebVitals.fid)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">CLS</span>
                          <span className={getCWVStatus('cls', quickScanResults.desktop.coreWebVitals.cls)}>
                            {quickScanResults.desktop.coreWebVitals.cls.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Results */}
                {quickScanResults.mobile && (
                  <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                    <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                      Mobile
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.mobile.performanceScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Performance</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.mobile.performanceScore)}`}>
                          {quickScanResults.mobile.performanceScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.mobile.accessibilityScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Accessibility</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.mobile.accessibilityScore)}`}>
                          {quickScanResults.mobile.accessibilityScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.mobile.bestPracticesScore)}`}>
                        <p className="text-xs text-[#6b6b80]">Best Practices</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.mobile.bestPracticesScore)}`}>
                          {quickScanResults.mobile.bestPracticesScore}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${getScoreBgColor(quickScanResults.mobile.seoScore)}`}>
                        <p className="text-xs text-[#6b6b80]">SEO</p>
                        <p className={`text-2xl font-bold ${getScoreColor(quickScanResults.mobile.seoScore)}`}>
                          {quickScanResults.mobile.seoScore}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
                      <p className="text-xs text-[#6b6b80] mb-2">Core Web Vitals</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">LCP</span>
                          <span className={getCWVStatus('lcp', quickScanResults.mobile.coreWebVitals.lcp)}>
                            {formatTime(quickScanResults.mobile.coreWebVitals.lcp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">FID</span>
                          <span className={getCWVStatus('fid', quickScanResults.mobile.coreWebVitals.fid)}>
                            {formatTime(quickScanResults.mobile.coreWebVitals.fid)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6b6b80]">CLS</span>
                          <span className={getCWVStatus('cls', quickScanResults.mobile.coreWebVitals.cls)}>
                            {quickScanResults.mobile.coreWebVitals.cls.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowQuickScan(false);
                  setQuickScanUrl('');
                  setQuickScanResults(null);
                }}
                className="px-4 py-2 rounded-xl border border-[#27272a] text-[#a1a1b5] font-medium hover:bg-[#1a1a25] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

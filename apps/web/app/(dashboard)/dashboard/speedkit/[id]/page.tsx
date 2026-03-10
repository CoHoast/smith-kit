'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
}

interface ScanResult {
  id: string;
  device: 'mobile' | 'desktop';
  performance_score: number;
  accessibility_score: number;
  best_practices_score: number;
  seo_score: number;
  lcp_ms: number;
  fid_ms: number;
  cls: number;
  fcp_ms: number;
  ttfb_ms: number;
  scanned_at: string;
}

export default function SpeedKitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const urlId = params.id as string;

  const [urlData, setUrlData] = useState<SpeedKitUrl | null>(null);
  const [desktopResults, setDesktopResults] = useState<ScanResult[]>([]);
  const [mobileResults, setMobileResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');

  useEffect(() => {
    loadResults();
  }, [urlId]);

  const loadResults = async () => {
    try {
      const res = await fetch(`/api/speedkit/results?url_id=${urlId}&days=30`);
      const data = await res.json();

      if (data.error) {
        router.push('/dashboard/speedkit');
        return;
      }

      setUrlData(data.url);
      setDesktopResults(data.desktop?.results || []);
      setMobileResults(data.mobile?.results || []);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
    setIsLoading(false);
  };

  const runScan = async () => {
    setIsScanning(true);
    try {
      await fetch('/api/speedkit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: urlId, device: 'both' }),
      });
      await loadResults();
    } catch (error) {
      console.error('Failed to run scan:', error);
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
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const t = thresholds[metric];
    if (!t) return 'text-gray-500';
    if (value <= t.good) return 'text-green-500';
    if (value <= t.poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getCWVLabel = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
    };

    const t = thresholds[metric];
    if (!t) return 'N/A';
    if (value <= t.good) return 'Good';
    if (value <= t.poor) return 'Needs Improvement';
    return 'Poor';
  };

  const results = activeTab === 'desktop' ? desktopResults : mobileResults;
  const latestResult = results[0];

  // Chart data for score history
  const chartData = results.slice(0, 14).reverse();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  if (!urlData) {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link 
            href="/dashboard/speedkit" 
            className="text-[#6b6b80] hover:text-white text-sm mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to SpeedKit
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">{urlData.name}</h1>
          <p className="text-[#a1a1b5]">{urlData.url}</p>
        </div>
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              Run Scan
            </>
          )}
        </button>
      </div>

      {/* Device Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'desktop'
              ? 'bg-[#6366f1] text-white'
              : 'bg-[#12121a] text-[#a1a1b5] hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          Desktop
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
            activeTab === 'mobile'
              ? 'bg-[#6366f1] text-white'
              : 'bg-[#12121a] text-[#a1a1b5] hover:text-white'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
          Mobile
        </button>
      </div>

      {latestResult ? (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-6 rounded-2xl border border-[#1e1e2e] ${getScoreBgColor(latestResult.performance_score)}`}>
              <p className="text-[#6b6b80] text-sm mb-1">Performance</p>
              <p className={`text-4xl font-bold ${getScoreColor(latestResult.performance_score)}`}>
                {latestResult.performance_score}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border border-[#1e1e2e] ${getScoreBgColor(latestResult.accessibility_score)}`}>
              <p className="text-[#6b6b80] text-sm mb-1">Accessibility</p>
              <p className={`text-4xl font-bold ${getScoreColor(latestResult.accessibility_score)}`}>
                {latestResult.accessibility_score}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border border-[#1e1e2e] ${getScoreBgColor(latestResult.best_practices_score)}`}>
              <p className="text-[#6b6b80] text-sm mb-1">Best Practices</p>
              <p className={`text-4xl font-bold ${getScoreColor(latestResult.best_practices_score)}`}>
                {latestResult.best_practices_score}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border border-[#1e1e2e] ${getScoreBgColor(latestResult.seo_score)}`}>
              <p className="text-[#6b6b80] text-sm mb-1">SEO</p>
              <p className={`text-4xl font-bold ${getScoreColor(latestResult.seo_score)}`}>
                {latestResult.seo_score}
              </p>
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Core Web Vitals</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b6b80]">LCP</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCWVStatus('lcp', latestResult.lcp_ms)} bg-current/10`}>
                    {getCWVLabel('lcp', latestResult.lcp_ms)}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${getCWVStatus('lcp', latestResult.lcp_ms)}`}>
                  {formatTime(latestResult.lcp_ms)}
                </p>
                <p className="text-xs text-[#6b6b80] mt-1">Largest Contentful Paint</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b6b80]">FID</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCWVStatus('fid', latestResult.fid_ms)} bg-current/10`}>
                    {getCWVLabel('fid', latestResult.fid_ms)}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${getCWVStatus('fid', latestResult.fid_ms)}`}>
                  {formatTime(latestResult.fid_ms)}
                </p>
                <p className="text-xs text-[#6b6b80] mt-1">First Input Delay</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b6b80]">CLS</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCWVStatus('cls', latestResult.cls)} bg-current/10`}>
                    {getCWVLabel('cls', latestResult.cls)}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${getCWVStatus('cls', latestResult.cls)}`}>
                  {latestResult.cls.toFixed(3)}
                </p>
                <p className="text-xs text-[#6b6b80] mt-1">Cumulative Layout Shift</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b6b80]">FCP</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCWVStatus('fcp', latestResult.fcp_ms)} bg-current/10`}>
                    {getCWVLabel('fcp', latestResult.fcp_ms)}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${getCWVStatus('fcp', latestResult.fcp_ms)}`}>
                  {formatTime(latestResult.fcp_ms)}
                </p>
                <p className="text-xs text-[#6b6b80] mt-1">First Contentful Paint</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6b6b80]">TTFB</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${getCWVStatus('ttfb', latestResult.ttfb_ms)} bg-current/10`}>
                    {getCWVLabel('ttfb', latestResult.ttfb_ms)}
                  </span>
                </div>
                <p className={`text-2xl font-bold ${getCWVStatus('ttfb', latestResult.ttfb_ms)}`}>
                  {formatTime(latestResult.ttfb_ms)}
                </p>
                <p className="text-xs text-[#6b6b80] mt-1">Time to First Byte</p>
              </div>
            </div>
          </div>

          {/* Score History Chart */}
          {chartData.length > 1 && (
            <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Performance History (Last 14 Scans)</h2>
              <div className="h-48 relative">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((value) => (
                    <g key={value}>
                      <line
                        x1="0"
                        y1={`${100 - value}%`}
                        x2="100%"
                        y2={`${100 - value}%`}
                        stroke="#1e1e2e"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y={`${100 - value}%`}
                        dy="-4"
                        fill="#6b6b80"
                        fontSize="10"
                      >
                        {value}
                      </text>
                    </g>
                  ))}

                  {/* Performance line */}
                  <polyline
                    points={chartData.map((r, i) => {
                      const x = (i / (chartData.length - 1)) * 100;
                      const y = 100 - (r.performance_score || 0);
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {chartData.map((r, i) => {
                    const x = (i / (chartData.length - 1)) * 100;
                    const y = 100 - (r.performance_score || 0);
                    return (
                      <circle
                        key={r.id}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#6366f1"
                        className="cursor-pointer"
                      >
                        <title>{`${new Date(r.scanned_at).toLocaleDateString()}: ${r.performance_score}`}</title>
                      </circle>
                    );
                  })}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[#6b6b80] -mb-6">
                  {chartData.length > 0 && (
                    <>
                      <span>{new Date(chartData[0].scanned_at).toLocaleDateString()}</span>
                      <span>{new Date(chartData[chartData.length - 1].scanned_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scan History Table */}
          <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
            <h2 className="text-lg font-bold text-white mb-4">Scan History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#6b6b80] text-sm border-b border-[#1e1e2e]">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Performance</th>
                    <th className="pb-3 font-medium">Accessibility</th>
                    <th className="pb-3 font-medium">Best Practices</th>
                    <th className="pb-3 font-medium">SEO</th>
                    <th className="pb-3 font-medium">LCP</th>
                    <th className="pb-3 font-medium">CLS</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 10).map((result) => (
                    <tr key={result.id} className="border-b border-[#1e1e2e] hover:bg-[#0a0a0f]">
                      <td className="py-3 text-sm text-[#a1a1b5]">
                        {new Date(result.scanned_at).toLocaleString()}
                      </td>
                      <td className={`py-3 text-sm font-medium ${getScoreColor(result.performance_score)}`}>
                        {result.performance_score}
                      </td>
                      <td className={`py-3 text-sm font-medium ${getScoreColor(result.accessibility_score)}`}>
                        {result.accessibility_score}
                      </td>
                      <td className={`py-3 text-sm font-medium ${getScoreColor(result.best_practices_score)}`}>
                        {result.best_practices_score}
                      </td>
                      <td className={`py-3 text-sm font-medium ${getScoreColor(result.seo_score)}`}>
                        {result.seo_score}
                      </td>
                      <td className={`py-3 text-sm ${getCWVStatus('lcp', result.lcp_ms)}`}>
                        {formatTime(result.lcp_ms)}
                      </td>
                      <td className={`py-3 text-sm ${getCWVStatus('cls', result.cls)}`}>
                        {result.cls.toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a25] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#6b6b80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No scans yet</h2>
          <p className="text-[#6b6b80] text-center max-w-md mb-6">
            Run a scan to see performance data for this URL.
          </p>
          <button
            onClick={runScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-medium transition-colors disabled:opacity-50"
          >
            {isScanning ? 'Scanning...' : 'Run First Scan'}
          </button>
        </div>
      )}

      {/* Last scanned info */}
      {urlData.last_scanned_at && (
        <div className="mt-6 text-center text-sm text-[#6b6b80]">
          Last scanned: {new Date(urlData.last_scanned_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

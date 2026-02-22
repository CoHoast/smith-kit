import { Skeleton, MonitorSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-72 h-5" />
        </div>
        <Skeleton className="w-32 h-10 rounded-xl" />
      </div>

      {/* Status Page Link */}
      <div className="mb-6 p-4 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Skeleton className="w-28 h-4 mb-2" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
          <div>
            <Skeleton className="w-24 h-4 mb-2" />
            <Skeleton className="w-full h-10 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Monitors */}
      <div className="space-y-4">
        <MonitorSkeleton />
        <MonitorSkeleton />
      </div>
    </div>
  );
}

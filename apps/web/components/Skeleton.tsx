export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1a1a25] rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
      <Skeleton className="w-24 h-5 mb-2" />
      <Skeleton className="w-full h-4 mb-1" />
      <Skeleton className="w-3/4 h-4 mb-4" />
      <div className="pt-4 border-t border-[#1e1e2e] flex justify-between">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-8 h-6" />
      </div>
    </div>
  );
}

export function MonitorSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-3 h-3 rounded-full" />
          <div>
            <Skeleton className="w-32 h-5 mb-2" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <Skeleton className="w-16 h-6 mb-1" />
            <Skeleton className="w-12 h-3" />
          </div>
          <div className="text-center">
            <Skeleton className="w-14 h-6 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
        <div className="flex justify-between mb-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-24 h-3" />
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 30 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-6 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChangelogSkeleton() {
  return (
    <div className="rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-16 h-4" />
        </div>
        <Skeleton className="w-5 h-5" />
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f]">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="w-3/4 h-4 mb-1" />
        <Skeleton className="w-1/4 h-3" />
      </div>
      <Skeleton className="w-12 h-3" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="w-48 h-8 mb-2" />
        <Skeleton className="w-64 h-5" />
      </div>

      {/* Plan Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="w-20 h-4 mb-2" />
            <Skeleton className="w-16 h-6" />
          </div>
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <Skeleton className="w-32 h-5 mb-4" />
          <div className="space-y-3">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <Skeleton className="w-28 h-5 mb-4" />
          <div className="space-y-2">
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
            <Skeleton className="w-full h-16 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

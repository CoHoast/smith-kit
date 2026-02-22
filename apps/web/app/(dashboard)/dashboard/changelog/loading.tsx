import { Skeleton, ChangelogSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="w-40 h-8 mb-2" />
          <Skeleton className="w-80 h-5" />
        </div>
        <Skeleton className="w-40 h-10 rounded-xl" />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-3">
          <Skeleton className="w-full h-12 rounded-xl" />
          <Skeleton className="w-full h-12 rounded-xl" />
        </div>

        {/* Main Content */}
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-36 h-10 rounded-xl" />
          </div>
          <div className="space-y-4">
            <ChangelogSkeleton />
            <ChangelogSkeleton />
            <ChangelogSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

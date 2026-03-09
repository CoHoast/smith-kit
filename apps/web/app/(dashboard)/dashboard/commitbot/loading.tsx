import { Skeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="w-40 h-8 mb-2" />
          <Skeleton className="w-72 h-5" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <Skeleton className="w-32 h-4 mb-2" />
          <Skeleton className="w-12 h-8" />
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <Skeleton className="w-28 h-4 mb-2" />
          <Skeleton className="w-12 h-8" />
        </div>
        <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
          <Skeleton className="w-20 h-4 mb-2" />
          <Skeleton className="w-8 h-8" />
        </div>
      </div>

      {/* Installation */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] mb-6">
        <Skeleton className="w-28 h-5 mb-4" />
        <Skeleton className="w-32 h-4 mb-2" />
        <Skeleton className="w-full h-12 rounded-lg mb-4" />
        <Skeleton className="w-36 h-4 mb-2" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* API Keys */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e] mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-24 h-5" />
          <Skeleton className="w-28 h-10 rounded-xl" />
        </div>
        <Skeleton className="w-full h-16 rounded-lg" />
      </div>

      {/* Preferences */}
      <div className="p-6 rounded-2xl bg-[#12121a] border border-[#1e1e2e]">
        <Skeleton className="w-28 h-5 mb-4" />
        <Skeleton className="w-full h-12 rounded-lg mb-4" />
        <Skeleton className="w-full h-10 rounded-lg mb-2" />
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}

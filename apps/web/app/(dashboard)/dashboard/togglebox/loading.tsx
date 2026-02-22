import { Skeleton } from '@/components/Skeleton';

export default function ToggleBoxLoading() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-4">
            <Skeleton className="h-4 w-20 mb-4" />
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full mb-3" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

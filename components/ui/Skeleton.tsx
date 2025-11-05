export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 sm:p-5 md:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="w-10 h-10 rounded" />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 sm:p-5 md:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="w-10 h-10 rounded" />
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonJobCard() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Skeleton className="w-3 h-3 rounded-full mt-2" />
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <>
      {/* Sidebar Skeleton */}
      <div className="fixed left-0 top-0 h-full w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="px-3 py-4 space-y-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 md:ml-56">
      {/* Header Skeleton */}
      <div className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 sm:px-4 md:px-6">
        <Skeleton className="h-6 w-32" />
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <main className="p-3 sm:p-4 md:p-6">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}


import Skeleton from "@mui/material/Skeleton";

export const SetupStreamSkeleton = () => {
  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <Skeleton className="h-9 w-48 rounded-lg" />

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-36 rounded-lg" />
            <Skeleton className="h-9 w-full sm:w-40 rounded-lg" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Stream Preview Skeleton */}
          <div className="w-full lg:w-[400px] xl:w-[480px] shrink-0">
            {/* Preview Box */}
            <Skeleton className="w-full aspect-video rounded-2xl" />

            {/* Status Alert Skeleton */}
            <div className="mt-4 p-4 rounded-xl border border-border/50 bg-surface/50">
              <Skeleton className="h-5 w-16 mb-2 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-4/5 rounded" />
              </div>
            </div>
          </div>

          {/* Right Columns: Configuration */}
          <div className="flex-1 w-full grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
            {/* Middle: Connection Details Skeleton */}
            <div className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
              <Skeleton className="h-6 w-48 rounded-lg" />

              <div className="space-y-5 flex-1 mt-2">
                {/* Field 1 */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                {/* Field 2 */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                {/* Field 3 */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
                {/* Field 4 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            </div>

            {/* Right: Quick Start Guide Skeleton */}
            <div className="bg-surface border border-white/5 rounded-2xl p-5 sm:p-6 h-full flex flex-col gap-5">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <div className="space-y-6 mt-2">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                  </div>
                </div>
                {/* Step 3 */}
                <div className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-3 w-11/12 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

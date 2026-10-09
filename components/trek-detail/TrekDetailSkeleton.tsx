import { Skeleton } from "@/components/ui/skeleton";

export default function TrekDetailSkeleton() {
  return (
    <main className="w-full bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6">
        {/* Breadcrumbs */}
        <Skeleton className="h-4 w-72" />

        {/* Title */}
        <Skeleton className="mt-3 h-9 w-96" />

        {/* Pills */}
        <div className="mt-3 flex gap-3">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>

        {/* HERO + BOOKING */}
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-[320px] w-full rounded-xl" />
            <Skeleton className="h-[140px] w-full rounded-xl" />
          </div>
        </div>

        {/* ICON STATS */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-[calc(66.666%_-_12px)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[92px] rounded-xl" />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            {/* Overview */}
            <div>
              <Skeleton className="h-6 w-40" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <Skeleton className="h-6 w-32" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Table */}
            <div>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="mt-4 h-40 rounded-xl" />
            </div>

            {/* Itinerary */}
            <div>
              <Skeleton className="h-6 w-32" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Trip Info */}
            <div>
              <Skeleton className="h-6 w-40" />
              <div className="mt-4 space-y-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            </div>

            {/* Reviews */}
            <div>
              <Skeleton className="h-6 w-52" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4" />
        </div>

        {/* Explore More */}
        <div className="mt-14">
          <Skeleton className="mx-auto h-6 w-56" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

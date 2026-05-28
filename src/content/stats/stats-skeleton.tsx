import { Skeleton } from "@/components/ui/skeleton";

/** Replica o layout do PomodoroStats durante o carregamento */
export function StatsSkeleton() {
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto h-full gap-3">
      {/* Header: título + period buttons */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-28 rounded" />
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-14 rounded-md" />
          ))}
        </div>
      </div>

      {/* View selector tabs */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 flex-1 rounded-md" />
        ))}
      </div>

      {/* Stat cards — 3 em linha */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background/50 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-3/4 rounded" />
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>

      {/* Aquarium / estrelas */}
      <Skeleton className="h-24 w-full rounded-lg" />

      {/* Chart */}
      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-end gap-1.5 h-28 w-full">
          {[40, 70, 45, 85, 30, 65, 55].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-sm"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <Skeleton key={d} className="h-3 w-6 rounded" />
          ))}
        </div>
      </div>

      {/* Recent sessions list */}
      <div className="flex flex-col gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-background/50 border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-3">
            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-3.5 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

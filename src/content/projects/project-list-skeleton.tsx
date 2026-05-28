import { Skeleton } from "@/components/ui/skeleton";

/** Replica o layout da ProjectList durante o carregamento */
export function ProjectListSkeleton() {
  const items = [
    { nameW: "w-1/2", descW: "w-1/3", progress: 60 },
    { nameW: "w-2/3", descW: "w-1/4", progress: 30 },
    { nameW: "w-2/5", descW: "w-2/5", progress: 85 },
  ];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Input row */}
      <div className="flex gap-2 w-full items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>

      {/* Project items */}
      <div className="flex flex-col gap-2 w-full">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-background/50 border border-white/10 rounded-lg overflow-hidden flex items-center gap-0"
          >
            {/* Color bar */}
            <Skeleton className="w-2 self-stretch rounded-none" />

            <div className="flex items-center gap-3 flex-1 px-4 py-3">
              {/* Icon box */}
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

              {/* Text */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Skeleton className={`h-4 ${item.nameW}`} />
                <Skeleton className={`h-3 ${item.descW}`} />
                {/* Progress bar */}
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 bg-white/10 rounded-full flex-1 overflow-hidden">
                    <Skeleton
                      className="h-full rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
              </div>

              {/* Trailing */}
              <Skeleton className="w-6 h-6 rounded shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

/** Replica o layout da SkillList durante o carregamento */
export function SkillListSkeleton() {
  const items = [
    { nameW: "w-1/3", levelW: "w-20", progress: 45 },
    { nameW: "w-2/5", levelW: "w-16", progress: 72 },
    { nameW: "w-1/4", levelW: "w-24", progress: 20 },
    { nameW: "w-2/5", levelW: "w-20", progress: 90 },
  ];

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
      {/* Input row */}
      <div className="flex gap-2 w-full items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>

      {/* Skill items */}
      <div className="flex flex-col gap-1 w-full">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-background/50 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"
          >
            {/* Icon box */}
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />

            {/* Content */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className={`h-4 ${item.nameW}`} />
                <Skeleton className={`h-3.5 ${item.levelW} rounded-full`} />
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="h-1.5 bg-white/10 rounded-full w-32 overflow-hidden">
                  <Skeleton
                    className="h-full rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <Skeleton className="h-3 w-10 rounded" />
              </div>
            </div>

            {/* Trailing */}
            <Skeleton className="w-5 h-5 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

/** Replica o layout da DiaryList durante o carregamento */
export function DiaryListSkeleton() {
  const entries = [
    { contentW: "w-3/4", metaW: "w-1/4", lines: 2 },
    { contentW: "w-2/3", metaW: "w-1/3", lines: 1 },
    { contentW: "w-5/6", metaW: "w-1/4", lines: 2 },
    { contentW: "w-1/2", metaW: "w-1/3", lines: 1 },
  ];

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto overflow-hidden">
      {/* Input row — diary input is a bit taller */}
      <div className="flex gap-2 w-full items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>

      {/* Date filter chips */}
      <div className="flex gap-2 w-full mt-1 flex-wrap">
        <Skeleton className="h-7 w-16 rounded-md" />
        <Skeleton className="h-7 w-20 rounded-md" />
        <Skeleton className="h-7 w-14 rounded-md" />
        <Skeleton className="h-7 w-18 rounded-md" />
        <Skeleton className="h-7 w-12 rounded-md" />
      </div>

      {/* Diary entries */}
      <div className="flex flex-col gap-2 w-full">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="bg-background/50 border border-white/10 rounded-lg px-4 py-3"
          >
            {/* Header: time chip + date */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-10 rounded-full" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            {/* Content lines */}
            <div className="flex flex-col gap-1.5">
              <Skeleton className={`h-3.5 ${entry.contentW}`} />
              {entry.lines === 2 && <Skeleton className={`h-3.5 ${entry.metaW}`} />}
            </div>
            {/* Footer: tag + mood */}
            <div className="flex items-center gap-2 mt-2">
              <Skeleton className="h-4 w-14 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

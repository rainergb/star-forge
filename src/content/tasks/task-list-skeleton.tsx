import { Skeleton } from "@/components/ui/skeleton";

/** Replica o layout da TaskList durante o carregamento */
export function TaskListSkeleton() {
  const items = [
    { titleW: "w-2/3", metaW: "w-1/4", hasMeta: true },
    { titleW: "w-1/2", metaW: "w-1/3", hasMeta: true },
    { titleW: "w-3/4", metaW: "w-1/4", hasMeta: true },
    { titleW: "w-1/2", metaW: "",       hasMeta: false },
    { titleW: "w-2/3", metaW: "w-1/3", hasMeta: true },
  ];

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
      {/* Input row */}
      <div className="flex gap-2 w-full items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
      </div>

      {/* Filter chips row */}
      <div className="flex gap-2 w-full mt-1">
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Section label */}
      <div className="flex items-center gap-2 w-full mt-1">
        <Skeleton className="h-3.5 w-28 rounded" />
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Task items */}
      <div className="flex flex-col gap-1 w-full">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-background/50 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3"
          >
            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <Skeleton className={`h-4 ${item.titleW}`} />
              {item.hasMeta && <Skeleton className={`h-3 ${item.metaW}`} />}
            </div>
            <Skeleton className="w-4 h-4 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

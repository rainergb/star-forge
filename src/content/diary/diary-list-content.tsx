import { BookOpen } from "lucide-react";
import { DiaryEntry } from "@/types/diary.types";
import { DiaryItem } from "./diary-item";
import type { DiaryDateFilterOption } from "./diary-date-filter";
import { EmptyState, ListSummary } from "@/components/shared/list-container";
import { cn } from "@/lib/utils";

interface DiaryListContentProps {
  entries: DiaryEntry[];
  dateFilter: DiaryDateFilterOption;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onEntryClick: (entry: DiaryEntry) => void;
}

const getDateLabel = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
  });
};

const getFilterSummaryLabel = (
  filter: DiaryDateFilterOption,
  count: number
): string => {
  const noun = count === 1 ? "entry" : "entries";
  switch (filter) {
    case "today":     return `${count} ${noun} today`;
    case "yesterday": return `${count} ${noun} yesterday`;
    case "week":      return `${count} ${noun} this week`;
    case "month":     return `${count} ${noun} this month`;
    case "custom":    return `${count} ${noun} in selected range`;
    default:          return `${count} ${noun} total`;
  }
};

export function DiaryListContent({
  entries,
  dateFilter,
  onToggleFavorite,
  onRemove,
  onEntryClick
}: DiaryListContentProps) {
  if (entries.length === 0) {
    return (
      <>
        <ListSummary
          label={getFilterSummaryLabel(dateFilter, 0)}
          completed={0}
          total={0}
        />
        <EmptyState
          icon={BookOpen}
          message={
            dateFilter === "today" ? "No entries for today" : "No entries found"
          }
          hint={
            dateFilter === "today"
              ? "Start writing to add your first entry"
              : "Try a different date range"
          }
        />
      </>
    );
  }

  // Newest date first; within the same date, newest time first
  const sortedEntries = [...entries].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    if (a.time && b.time) return b.time.localeCompare(a.time);
    return b.createdAt - a.createdAt;
  });

  // Single-day filters: skip group headers
  const showGroupHeaders =
    dateFilter !== "today" && dateFilter !== "yesterday";

  // Build groups for multi-day views
  const groups: { date: string; items: DiaryEntry[] }[] = [];
  if (showGroupHeaders) {
    for (const entry of sortedEntries) {
      const last = groups[groups.length - 1];
      if (last && last.date === entry.date) {
        last.items.push(entry);
      } else {
        groups.push({ date: entry.date, items: [entry] });
      }
    }
  }

  return (
    <>
      <ListSummary
        label={getFilterSummaryLabel(dateFilter, entries.length)}
        completed={entries.length}
        total={entries.length}
      />

      {/* Single scrollable container — same pattern as TaskListContent */}
      <div
        className={cn(
          "w-full max-h-[60vh] overflow-y-auto scrollbar-none",
          showGroupHeaders ? "space-y-1" : "space-y-2"
        )}
      >
        {showGroupHeaders ? (
          groups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 py-1.5 sticky top-0 bg-transparent z-10">
                <span className="text-xs font-medium text-white/40 whitespace-nowrap">
                  {getDateLabel(group.date)}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-2">
                {group.items.map((entry) => (
                  <DiaryItem
                    key={entry.id}
                    entry={entry}
                    onToggleFavorite={onToggleFavorite}
                    onRemove={onRemove}
                    onClick={() => onEntryClick(entry)}
                    onDoubleClick={() => onEntryClick(entry)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          sortedEntries.map((entry) => (
            <DiaryItem
              key={entry.id}
              entry={entry}
              onToggleFavorite={onToggleFavorite}
              onRemove={onRemove}
              onClick={() => onEntryClick(entry)}
              onDoubleClick={() => onEntryClick(entry)}
            />
          ))
        )}
      </div>
    </>
  );
}

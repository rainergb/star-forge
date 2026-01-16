import { DiaryEntry } from "@/types/diary.types";
import { DiaryItem } from "./diary-item";
import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/list-container";

interface DiaryListContentProps {
  entries: DiaryEntry[];
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onEntryClick: (entry: DiaryEntry) => void;
  emptyMessage?: string;
}

export function DiaryListContent({
  entries,
  onToggleFavorite,
  onRemove,
  onEntryClick,
  emptyMessage = "No entries for this day"
}: DiaryListContentProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        message={emptyMessage}
        hint="Start writing to add your first entry"
      />
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.time && b.time) {
      return b.time.localeCompare(a.time);
    }
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="flex flex-col gap-2">
      {sortedEntries.map((entry) => (
        <DiaryItem
          key={entry.id}
          entry={entry}
          onToggleFavorite={onToggleFavorite}
          onRemove={onRemove}
          onClick={() => onEntryClick(entry)}
        />
      ))}
    </div>
  );
}

import { DiaryEntry } from "@/types/diary.types";
import { DiaryItem } from "./diary-item";
import { BookOpen } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-12 text-white/40">
        <BookOpen className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
        <p className="text-xs mt-1">Start writing to add your first entry</p>
      </div>
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

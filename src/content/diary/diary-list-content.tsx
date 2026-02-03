import { BookOpen } from "lucide-react";
import { DiaryEntry } from "@/types/diary.types";
import { DiaryItem } from "./diary-item";
import {
  ListContainer,
  EmptyState,
  ListSummary
} from "@/components/shared/list-container";

interface DiaryListContentProps {
  entries: DiaryEntry[];
  selectedDate: string;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onEntryClick: (entry: DiaryEntry) => void;
}

const formatDateDisplay = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = dateObj.getTime() === today.getTime();

  if (isToday) return "Today";

  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
};

export function DiaryListContent({
  entries,
  selectedDate,
  onToggleFavorite,
  onRemove,
  onEntryClick
}: DiaryListContentProps) {
  if (entries.length === 0) {
    return (
      <>
        <ListSummary
          label={`entries on ${formatDateDisplay(selectedDate)}`}
          completed={0}
          total={0}
        />
        <EmptyState
          icon={BookOpen}
          message="No entries for this day"
          hint="Start writing to add your first entry"
        />
      </>
    );
  }

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.time && b.time) {
      return b.time.localeCompare(a.time);
    }
    return b.createdAt - a.createdAt;
  });

  return (
    <>
      <ListSummary
        label={`entries on ${formatDateDisplay(selectedDate)}`}
        completed={entries.length}
        total={entries.length}
      />
      <ListContainer>
        {sortedEntries.map((entry) => (
          <DiaryItem
            key={entry.id}
            entry={entry}
            onToggleFavorite={onToggleFavorite}
            onRemove={onRemove}
            onClick={() => onEntryClick(entry)}
            onDoubleClick={() => onEntryClick(entry)}
          />
        ))}
      </ListContainer>
    </>
  );
}

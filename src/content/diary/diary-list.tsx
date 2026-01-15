import { useState, useEffect, useMemo } from "react";
import { useDiary } from "@/hooks/use-diary";
import { DiaryInput } from "./diary-input";
import { DiaryListContent } from "./diary-list-content";
import { DiaryCalendar } from "./diary-calendar";
import { DiaryDetails } from "./diary-details";
import { DiaryEntry, DiaryEntryType, MoodEntry } from "@/types/diary.types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiaryListProps {
  initialDate?: string;
}

export function DiaryList({ initialDate }: DiaryListProps) {
  const {
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    toggleFavorite,
    setMood,
    setTags,
    addFile,
    removeFile,
    linkTask,
    getEntriesByDate,
    getMonthMoodData
  } = useDiary();

  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const [selectedDate, setSelectedDate] = useState(initialDate || getTodayDate());
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const currentMonthData = useMemo(() => {
    const [year, month] = selectedDate.split("-");
    return getMonthMoodData(`${year}-${month}`);
  }, [selectedDate, getMonthMoodData, entries]);

  const dayEntries = useMemo(() => {
    return getEntriesByDate(selectedDate);
  }, [selectedDate, getEntriesByDate, entries]);

  const handleAddEntry = (
    content: string,
    type: DiaryEntryType,
    options?: {
      mood?: MoodEntry | null;
      tags?: string[];
      time?: string | null;
    }
  ) => {
    addEntry(content, type, {
      date: selectedDate,
      ...options
    });
  };

  const handleEntryClick = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEntry(null);
  };

  const handleUpdateEntry = (updates: Partial<DiaryEntry>) => {
    if (selectedEntry) {
      updateEntry(selectedEntry.id, updates);
      setSelectedEntry({ ...selectedEntry, ...updates } as DiaryEntry);
    }
  };

  useEffect(() => {
    if (selectedEntry) {
      const updated = entries.find((e) => e.id === selectedEntry.id);
      if (updated) {
        setSelectedEntry(updated);
      }
    }
  }, [entries, selectedEntry?.id]);

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

  return (
    <div className="flex h-full gap-4">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-4">
          <DiaryInput onAddEntry={handleAddEntry} selectedDate={selectedDate} />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">
            {formatDateDisplay(selectedDate)}
          </h2>
          <span className="text-sm text-white/40">
            {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <ScrollArea className="flex-1">
          <DiaryListContent
            entries={dayEntries}
            onToggleFavorite={toggleFavorite}
            onRemove={removeEntry}
            onEntryClick={handleEntryClick}
          />
        </ScrollArea>
      </div>

      <div className="w-72 shrink-0">
        <DiaryCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          monthMoodData={currentMonthData}
        />
      </div>

      {selectedEntry && (
        <DiaryDetails
          entry={selectedEntry}
          open={detailsOpen}
          onClose={handleCloseDetails}
          onToggleFavorite={() => toggleFavorite(selectedEntry.id)}
          onRemove={() => {
            removeEntry(selectedEntry.id);
            handleCloseDetails();
          }}
          onUpdateContent={(content) => handleUpdateEntry({ content })}
          onSetMood={(mood) => setMood(selectedEntry.id, mood)}
          onSetTags={(tags) => setTags(selectedEntry.id, tags)}
          onAddFile={(file) => addFile(selectedEntry.id, file)}
          onRemoveFile={(fileId) => removeFile(selectedEntry.id, fileId)}
          onLinkTask={(taskId) => linkTask(selectedEntry.id, taskId)}
        />
      )}
    </div>
  );
}

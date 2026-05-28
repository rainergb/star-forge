import { useState, useEffect, useMemo } from "react";
import { useDiary } from "@/hooks/use-diary";
import { useToast } from "@/hooks/use-toast";
import { DiaryInput } from "./diary-input";
import { DiaryListContent } from "./diary-list-content";
import { DiaryDetails } from "./diary-details";
import { DiaryDateFilter } from "./diary-date-filter";
import type { DiaryDateFilterOption, DiaryCustomDateRange } from "./diary-date-filter";
import { ExportButton } from "@/components/shared/export-button";
import { ImportButton } from "@/components/shared/import-button";
import {
  exportDiary,
  importFromFile,
  validateDiaryImport
} from "@/services/export-service";
import { DiaryEntry, DiaryEntryType, MoodEntry } from "@/types/diary.types";

interface DiaryListProps {
  initialDate?: string;
  selectedDate?: string;
}

const getTodayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const getDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function DiaryList({
  initialDate,
  selectedDate: externalSelectedDate
}: DiaryListProps) {
  const {
    entries,
    addEntry,
    removeEntry,
    updateEntry,
    toggleFavorite,
    setMood,
    addFile,
    removeFile,
    linkTask,
    importEntries
  } = useDiary();
  const { toast } = useToast();

  // The "selected date" is used only for the DiaryInput default date
  const [internalSelectedDate, setInternalSelectedDate] = useState(
    initialDate || getTodayStr()
  );
  const selectedDate = externalSelectedDate || internalSelectedDate;

  useEffect(() => {
    if (externalSelectedDate) {
      setInternalSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

  // Date filter state — default to "today" so it starts focused
  const [dateFilter, setDateFilter] = useState<DiaryDateFilterOption>("today");
  const [customDateRange, setCustomDateRange] = useState<DiaryCustomDateRange>({
    start: null,
    end: null
  });

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Apply date filter to all entries
  const filteredEntries = useMemo(() => {
    if (dateFilter === "all") return entries;

    const today = new Date();
    const todayStr = getDateStr(today);

    if (dateFilter === "today") {
      return entries.filter((e) => e.date === todayStr);
    }

    if (dateFilter === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return entries.filter((e) => e.date === getDateStr(yesterday));
    }

    if (dateFilter === "week") {
      // Sunday-based week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = getDateStr(weekStart);
      return entries.filter((e) => e.date >= weekStartStr && e.date <= todayStr);
    }

    if (dateFilter === "month") {
      const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
      return entries.filter((e) => e.date.startsWith(monthPrefix));
    }

    if (dateFilter === "custom" && customDateRange.start) {
      const startStr = getDateStr(customDateRange.start);
      const endStr = customDateRange.end
        ? getDateStr(customDateRange.end)
        : startStr;
      return entries.filter((e) => e.date >= startStr && e.date <= endStr);
    }

    return entries;
  }, [entries, dateFilter, customDateRange]);

  const handleAddEntry = (
    content: string,
    type: DiaryEntryType,
    options?: {
      mood?: MoodEntry | null;
      tags?: string[];
      time?: string | null;
      date?: string;
    }
  ) => {
    addEntry(content, type, {
      date: options?.date || selectedDate,
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
      if (updated) setSelectedEntry(updated);
    }
  }, [entries, selectedEntry?.id]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-2xl mx-auto overflow-hidden">
      <div className="flex gap-2 w-full items-center">
        <DiaryInput onAddEntry={handleAddEntry} selectedDate={selectedDate} />
        <ExportButton
          onExport={() => exportDiary(entries)}
          tooltip="Export diary"
        />
        <ImportButton
          onImport={async (file) => {
            const result = await importFromFile(file);
            if (result.success && result.data?.diary) {
              if (validateDiaryImport(result.data.diary)) {
                importEntries(result.data.diary);
                toast({
                  title: "Import successful",
                  description: `${result.data.diary.length} entries imported`
                });
              } else {
                toast({
                  title: "Import failed",
                  description: "Invalid diary format",
                  variant: "destructive"
                });
              }
            } else {
              toast({
                title: "Import failed",
                description: result.message,
                variant: "destructive"
              });
            }
          }}
          tooltip="Import diary"
        />
      </div>

      {/* Date filter — same toolbar row pattern as tasks */}
      <div className="flex gap-2 w-full mt-1">
        <DiaryDateFilter
          selectedFilter={dateFilter}
          onFilterChange={setDateFilter}
          customRange={customDateRange}
          onCustomRangeChange={setCustomDateRange}
        />
      </div>

      <DiaryListContent
        entries={filteredEntries}
        dateFilter={dateFilter}
        onToggleFavorite={toggleFavorite}
        onRemove={removeEntry}
        onEntryClick={handleEntryClick}
      />

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
          onUpdateType={(type) => handleUpdateEntry({ type })}
          onUpdateImage={(image) => handleUpdateEntry({ image })}
          onUpdateDate={(date, time) => handleUpdateEntry({ date, time })}
          onSetMood={(mood) => setMood(selectedEntry.id, mood)}
          onAddFile={(file) => addFile(selectedEntry.id, file)}
          onRemoveFile={(fileId) => removeFile(selectedEntry.id, fileId)}
          onLinkTask={(taskId) => linkTask(selectedEntry.id, taskId)}
        />
      )}
    </div>
  );
}

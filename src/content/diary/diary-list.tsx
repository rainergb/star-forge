import { useState, useEffect, useMemo } from "react";
import { useDiary } from "@/hooks/use-diary";
import { useToast } from "@/hooks/use-toast";
import { DiaryInput } from "./diary-input";
import { DiaryListContent } from "./diary-list-content";
import { DiaryDetails } from "./diary-details";
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
    getEntriesByDate,
    importEntries
  } = useDiary();
  const { toast } = useToast();

  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const [internalSelectedDate, setInternalSelectedDate] = useState(
    initialDate || getTodayDate()
  );
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Use external date if provided, otherwise use internal state
  const selectedDate = externalSelectedDate || internalSelectedDate;

  // Update internal date when external date changes
  useEffect(() => {
    if (externalSelectedDate) {
      setInternalSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

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
      if (updated) {
        setSelectedEntry(updated);
      }
    }
  }, [entries, selectedEntry?.id]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
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

      <DiaryListContent
        entries={dayEntries}
        selectedDate={selectedDate}
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

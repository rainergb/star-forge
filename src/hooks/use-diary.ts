import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  DiaryEntry,
  DiaryState,
  DiaryEntryType,
  MoodEntry,
  DiaryFile,
  MOOD_CONFIG,
  MoodLevel
} from "@/types/diary.types";

const STORAGE_KEY = "star-habit-diary";

const defaultState: DiaryState = {
  entries: [],
  tags: []
};

export function useDiary() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<DiaryState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const formatDate = (date: Date = new Date()): string => {
    return date.toISOString().split("T")[0];
  };

  const formatTime = (date: Date = new Date()): string => {
    return date.toTimeString().slice(0, 5);
  };

  const addEntry = useCallback(
    (
      content: string,
      type: DiaryEntryType = "note",
      options?: {
        date?: string;
        time?: string | null;
        mood?: MoodEntry | null;
        tags?: string[];
        linkedTaskId?: string | null;
      }
    ): string => {
      const id = generateId();
      const now = Date.now();
      const newEntry: DiaryEntry = {
        id,
        type,
        content,
        createdAt: now,
        updatedAt: now,
        date: options?.date ?? formatDate(),
        time: options?.time ?? formatTime(),
        image: null,
        mood: options?.mood ?? null,
        linkedTaskId: options?.linkedTaskId ?? null,
        tags: options?.tags ?? [],
        favorite: false,
        files: []
      };

      setState((prev) => {
        const newTags = [...new Set([...prev.tags, ...(options?.tags ?? [])])];
        return {
          ...prev,
          entries: [newEntry, ...prev.entries],
          tags: newTags
        };
      });

      return id;
    },
    [setState]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.filter((entry) => entry.id !== id)
      }));
    },
    [setState]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === id
            ? { ...entry, ...updates, updatedAt: Date.now() }
            : entry
        )
      }));
    },
    [setState]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === id
            ? { ...entry, favorite: !entry.favorite, updatedAt: Date.now() }
            : entry
        )
      }));
    },
    [setState]
  );

  const setMood = useCallback(
    (id: string, mood: MoodEntry | null) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === id ? { ...entry, mood, updatedAt: Date.now() } : entry
        )
      }));
    },
    [setState]
  );

  const setTags = useCallback(
    (id: string, tags: string[]) => {
      setState((prev) => {
        const allTags = [...new Set([...prev.tags, ...tags])];
        return {
          ...prev,
          entries: prev.entries.map((entry) =>
            entry.id === id ? { ...entry, tags, updatedAt: Date.now() } : entry
          ),
          tags: allTags
        };
      });
    },
    [setState]
  );

  const addFile = useCallback(
    (entryId: string, file: Omit<DiaryFile, "id" | "addedAt">) => {
      const newFile: DiaryFile = {
        ...file,
        id: generateId(),
        addedAt: Date.now()
      };
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                files: [...entry.files, newFile],
                updatedAt: Date.now()
              }
            : entry
        )
      }));
    },
    [setState]
  );

  const removeFile = useCallback(
    (entryId: string, fileId: string) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                files: entry.files.filter((f) => f.id !== fileId),
                updatedAt: Date.now()
              }
            : entry
        )
      }));
    },
    [setState]
  );

  const linkTask = useCallback(
    (entryId: string, taskId: string) => {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                linkedTaskId: taskId,
                type: "task-created" as DiaryEntryType,
                updatedAt: Date.now()
              }
            : entry
        )
      }));
    },
    [setState]
  );

  const getEntriesByDate = useCallback(
    (date: string): DiaryEntry[] => {
      return state.entries.filter((entry) => entry.date === date);
    },
    [state.entries]
  );

  const getEntriesByDateRange = useCallback(
    (startDate: string, endDate: string): DiaryEntry[] => {
      return state.entries.filter(
        (entry) => entry.date >= startDate && entry.date <= endDate
      );
    },
    [state.entries]
  );

  const getEntriesByType = useCallback(
    (type: DiaryEntryType): DiaryEntry[] => {
      return state.entries.filter((entry) => entry.type === type);
    },
    [state.entries]
  );

  const getEntriesByTag = useCallback(
    (tag: string): DiaryEntry[] => {
      return state.entries.filter((entry) => entry.tags.includes(tag));
    },
    [state.entries]
  );

  const getFavorites = useCallback((): DiaryEntry[] => {
    return state.entries.filter((entry) => entry.favorite);
  }, [state.entries]);

  const getDailyMoodSummary = useCallback(
    (date: string) => {
      const dayEntries = state.entries.filter(
        (entry) => entry.date === date && entry.mood !== null
      );

      if (dayEntries.length === 0) return null;

      const moods = dayEntries.map((e) => e.mood!.level);
      const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length;

      const moodCounts = moods.reduce(
        (acc, mood) => {
          acc[mood] = (acc[mood] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      const dominantMood = Object.entries(moodCounts).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];

      return {
        date,
        averageMood: Math.round(averageMood * 10) / 10,
        moodCount: moods.length,
        dominantMood: parseInt(dominantMood) as MoodLevel
      };
    },
    [state.entries]
  );

  const getMonthMoodData = useCallback(
    (yearMonth: string) => {
      const [year, month] = yearMonth.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEntries = state.entries.filter((e) => e.date === date);
        const moodEntries = dayEntries.filter((e) => e.mood !== null);

        const averageMood =
          moodEntries.length > 0
            ? moodEntries.reduce((sum, e) => sum + e.mood!.level, 0) /
              moodEntries.length
            : null;

        days.push({
          date,
          averageMood: averageMood
            ? Math.round(averageMood * 10) / 10
            : null,
          entryCount: dayEntries.length
        });
      }

      return { month: yearMonth, days };
    },
    [state.entries]
  );

  const addQuickMood = useCallback(
    (level: MoodLevel, note?: string): string => {
      const mood: MoodEntry = {
        level,
        emoji: MOOD_CONFIG[level].emoji,
        note: note ?? null,
        emotions: []
      };

      return addEntry(note || MOOD_CONFIG[level].label, "mood", { mood });
    },
    [addEntry]
  );

  const importEntries = useCallback(
    (importedEntries: DiaryEntry[], mode: "merge" | "replace" = "merge") => {
      setState((prev) => {
        if (mode === "replace") {
          return { ...prev, entries: importedEntries };
        }
        // Merge: add new entries, skip existing ones by id
        const existingIds = new Set(prev.entries.map((e) => e.id));
        const newEntries = importedEntries.filter(
          (e) => !existingIds.has(e.id)
        );
        return { ...prev, entries: [...newEntries, ...prev.entries] };
      });
    },
    [setState]
  );

  return {
    entries: state.entries,
    tags: state.tags,
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
    getEntriesByDateRange,
    getEntriesByType,
    getEntriesByTag,
    getFavorites,
    getDailyMoodSummary,
    getMonthMoodData,
    addQuickMood,
    importEntries
  };
}

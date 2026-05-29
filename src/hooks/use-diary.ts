import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { diaryService } from "@/services/supabase";
import { recordUserActivity } from "@/hooks/use-streak";
import { diaryCache } from "@/lib/cache-registry";
import {
  DiaryEntry,
  DiaryState,
  DiaryEntryType,
  MoodEntry,
  DiaryFile,
  MOOD_CONFIG,
  MoodLevel
} from "@/types/diary.types";
import { Database } from "@/types/database.types";

type DiaryRow = Database["public"]["Tables"]["diary_entries"]["Row"];
type DiaryInsert = Database["public"]["Tables"]["diary_entries"]["Insert"];
type DiaryUpdate = Database["public"]["Tables"]["diary_entries"]["Update"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "star-habit-diary";
const defaultState: DiaryState = { entries: [], tags: [] };

const generateId = (): string => crypto.randomUUID();


const formatDate = (date: Date = new Date()): string =>
  date.toISOString().split("T")[0];

const formatTime = (date: Date = new Date()): string =>
  date.toTimeString().slice(0, 5);

// MoodLevel (1-5) → mood text para a coluna simples do DB
const LEVEL_TO_MOOD: Record<MoodLevel, string> = {
  1: "very_bad",
  2: "bad",
  3: "neutral",
  4: "good",
  5: "very_good"
};

// ─── Mapeamento DB ↔ Local ───────────────────────────────────────────────────

function rowToEntry(row: DiaryRow): DiaryEntry {
  return {
    id: row.id,
    type: (row.entry_type as DiaryEntryType) ?? "note",
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at ?? row.created_at).getTime(),
    date: row.date,
    time: row.time ?? null,
    image: row.image ?? null,
    mood: (row.mood_entry as unknown as MoodEntry | null) ?? null,
    linkedTaskId: row.linked_task_id ?? null,
    tags: (row.tags as unknown as string[]) ?? [],
    favorite: row.favorite ?? false,
    files: (row.files as unknown as DiaryFile[]) ?? []
  };
}

function entryToInsert(entry: DiaryEntry, userId: string): DiaryInsert {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    content: entry.content,
    mood: entry.mood ? LEVEL_TO_MOOD[entry.mood.level] : null,
    created_at: new Date(entry.createdAt).toISOString(),
    entry_type: entry.type,
    time: entry.time,
    image: entry.image,
    mood_entry: entry.mood as unknown as any,
    linked_task_id: entry.linkedTaskId,
    tags: entry.tags as unknown as any,
    favorite: entry.favorite,
    files: entry.files as unknown as any,
    updated_at: new Date(entry.updatedAt).toISOString()
  };
}

function entryToUpdate(updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>): DiaryUpdate {
  const u: DiaryUpdate = {};
  if (updates.content !== undefined) u.content = updates.content;
  if (updates.date !== undefined) u.date = updates.date;
  if (updates.time !== undefined) u.time = updates.time;
  if (updates.type !== undefined) u.entry_type = updates.type;
  if (updates.image !== undefined) u.image = updates.image;
  if (updates.favorite !== undefined) u.favorite = updates.favorite;
  if (updates.linkedTaskId !== undefined) u.linked_task_id = updates.linkedTaskId;
  if (updates.tags !== undefined) u.tags = updates.tags as unknown as any;
  if (updates.files !== undefined) u.files = updates.files as unknown as any;
  if (updates.mood !== undefined) {
    u.mood_entry = updates.mood as unknown as any;
    u.mood = updates.mood ? LEVEL_TO_MOOD[updates.mood.level] : null;
  }
  u.updated_at = new Date().toISOString();
  return u;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDiary() {
  const { user, isGuest } = useAuth();
  const userId = user?.id ?? null;

  // --- Modo guest: localStorage ---
  const { value: localState, setValue: setLocalState } =
    useLocalStorage<DiaryState>(STORAGE_KEY, defaultState);

  // --- Modo autenticado: Supabase ---
  const [dbEntries, setDbEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const entries = isGuest ? (localState?.entries ?? []) : dbEntries;

  // Tags derivadas dos entries (não precisam de estado separado)
  const tags = useMemo(
    () => [...new Set(entries.flatMap((e) => e.tags))],
    [entries]
  );

  /** Atualiza React state + cache de forma atômica */
  const setDbWithCache = (updater: (prev: DiaryEntry[]) => DiaryEntry[]) => {
    setDbEntries((prev) => {
      const next = updater(prev);
      diaryCache.update(next);
      return next;
    });
  };

  // Carrega do Supabase ao montar (usa cache entre navegações)
  useEffect(() => {
    let cancelled = false;

    if (isGuest) { setIsLoading(false); return; }
    if (!userId) return;

    // SWR: mostra cache imediatamente, busca em background para atualizar
    const cached = diaryCache.get(userId);
    if (cached) { setDbEntries(cached); setIsLoading(false); }
    if (!cached) setIsLoading(true);

    diaryService
      .getEntries(userId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(rowToEntry);
        diaryCache.set(userId, mapped);
        setDbEntries(mapped);
      })
      .catch((err) => { if (!cancelled) console.error("[useDiary] load:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [userId, isGuest]);

  const applyState = (updater: (prev: DiaryEntry[]) => DiaryEntry[]) => {
    if (isGuest) {
      setLocalState((prev) => {
        const newEntries = updater(prev?.entries ?? []);
        const newTags = [...new Set(newEntries.flatMap((e) => e.tags))];
        return { ...prev, entries: newEntries, tags: newTags };
      });
    } else {
      setDbWithCache(updater);
    }
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

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

      if (isGuest) {
        setLocalState((prev) => {
          const newTags = [...new Set([...(prev?.tags ?? []), ...(options?.tags ?? [])])];
          return {
            ...prev,
            entries: [newEntry, ...(prev?.entries ?? [])],
            tags: newTags
          };
        });
      } else {
        setDbWithCache((prev) => [newEntry, ...prev]);
        if (userId) {
          diaryService
            .createEntry(entryToInsert(newEntry, userId))
            .catch((err) => console.error("[useDiary] create:", err));
        }
      }
      recordUserActivity();
      return id;
    },
    [isGuest, userId, setLocalState]
  );

  const removeEntry = useCallback(
    (id: string) => {
      applyState((prev) => prev.filter((e) => e.id !== id));
      if (!isGuest) {
        diaryService
          .deleteEntry(id)
          .catch((err) => console.error("[useDiary] delete:", err));
      }
    },
    [isGuest]
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<DiaryEntry, "id" | "createdAt">>) => {
      applyState((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
        )
      );
      if (!isGuest) {
        diaryService
          .updateEntry(id, entryToUpdate(updates))
          .catch((err) => console.error("[useDiary] update:", err));
      }
    },
    [isGuest]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = entries.find((e) => e.id === id);
      if (current) updateEntry(id, { favorite: !current.favorite });
    },
    [entries, updateEntry]
  );

  const setMood = useCallback(
    (id: string, mood: MoodEntry | null) => {
      updateEntry(id, { mood });
    },
    [updateEntry]
  );

  const setTags = useCallback(
    (id: string, newTags: string[]) => {
      updateEntry(id, { tags: newTags });
    },
    [updateEntry]
  );

  const addFile = useCallback(
    (entryId: string, file: Omit<DiaryFile, "id" | "addedAt">) => {
      const newFile: DiaryFile = { ...file, id: generateId(), addedAt: Date.now() };
      applyState((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, files: [...e.files, newFile], updatedAt: Date.now() }
            : e
        )
      );
      if (!isGuest) {
        const entry = dbEntries.find((e) => e.id === entryId);
        if (entry) {
          diaryService
            .updateEntry(entryId, {
              files: [...entry.files, newFile] as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useDiary] addFile:", err));
        }
      }
    },
    [isGuest, dbEntries]
  );

  const removeFile = useCallback(
    (entryId: string, fileId: string) => {
      applyState((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, files: e.files.filter((f) => f.id !== fileId), updatedAt: Date.now() }
            : e
        )
      );
      if (!isGuest) {
        const entry = dbEntries.find((e) => e.id === entryId);
        if (entry) {
          diaryService
            .updateEntry(entryId, {
              files: entry.files.filter((f) => f.id !== fileId) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useDiary] removeFile:", err));
        }
      }
    },
    [isGuest, dbEntries]
  );

  const linkTask = useCallback(
    (entryId: string, taskId: string) => {
      updateEntry(entryId, { linkedTaskId: taskId, type: "task-created" });
    },
    [updateEntry]
  );

  const getEntriesByDate = useCallback(
    (date: string): DiaryEntry[] => entries.filter((e) => e.date === date),
    [entries]
  );

  const getEntriesByDateRange = useCallback(
    (startDate: string, endDate: string): DiaryEntry[] =>
      entries.filter((e) => e.date >= startDate && e.date <= endDate),
    [entries]
  );

  const getEntriesByType = useCallback(
    (type: DiaryEntryType): DiaryEntry[] => entries.filter((e) => e.type === type),
    [entries]
  );

  const getEntriesByTag = useCallback(
    (tag: string): DiaryEntry[] => entries.filter((e) => e.tags.includes(tag)),
    [entries]
  );

  const getFavorites = useCallback(
    (): DiaryEntry[] => entries.filter((e) => e.favorite),
    [entries]
  );

  const getDailyMoodSummary = useCallback(
    (date: string) => {
      const dayEntries = entries.filter((e) => e.date === date && e.mood !== null);
      if (dayEntries.length === 0) return null;
      const moods = dayEntries.map((e) => e.mood!.level);
      const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length;
      const moodCounts = moods.reduce(
        (acc, mood) => { acc[mood] = (acc[mood] || 0) + 1; return acc; },
        {} as Record<number, number>
      );
      const dominantMood = parseInt(
        Object.entries(moodCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      ) as MoodLevel;
      return {
        date,
        averageMood: Math.round(averageMood * 10) / 10,
        moodCount: moods.length,
        dominantMood
      };
    },
    [entries]
  );

  const getMonthMoodData = useCallback(
    (yearMonth: string) => {
      const [year, month] = yearMonth.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEntries = entries.filter((e) => e.date === date);
        const moodEntries = dayEntries.filter((e) => e.mood !== null);
        const averageMood =
          moodEntries.length > 0
            ? moodEntries.reduce((sum, e) => sum + e.mood!.level, 0) / moodEntries.length
            : null;
        days.push({
          date,
          averageMood: averageMood ? Math.round(averageMood * 10) / 10 : null,
          entryCount: dayEntries.length
        });
      }
      return { month: yearMonth, days };
    },
    [entries]
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
      applyState((prev) => {
        if (mode === "replace") return importedEntries;
        const existingIds = new Set(prev.map((e) => e.id));
        const newEntries = importedEntries.filter((e) => !existingIds.has(e.id));
        return [...newEntries, ...prev];
      });
    },
    []
  );

  return {
    entries,
    tags,
    isLoading,
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

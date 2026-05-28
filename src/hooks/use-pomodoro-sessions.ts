import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { pomodoroService } from "@/services/supabase";
import { sessionCache } from "@/lib/cache-registry";
import {
  PomodoroSession,
  PomodoroSessionsState,
  PomodoroStats,
  StatsPeriod,
  TaskPomodoroStats,
  TimerMode
} from "@/types/pomodoro.types";
import { Database } from "@/types/database.types";

type SessionRow = Database["public"]["Tables"]["pomodoro_sessions"]["Row"];
type SessionInsert = Database["public"]["Tables"]["pomodoro_sessions"]["Insert"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "star-habit-pomodoro-sessions";
const defaultState: PomodoroSessionsState = { sessions: [] };

const generateId = (): string => crypto.randomUUID();


const getPeriodStartTime = (period: StatsPeriod): number => {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    case "week": {
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff).getTime();
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    case "year":
      return new Date(now.getFullYear(), 0, 1).getTime();
    case "all":
    default:
      return 0;
  }
};

// ─── Mapeamento DB ↔ Local ───────────────────────────────────────────────────

function rowToSession(row: SessionRow): PomodoroSession {
  return {
    id: row.id,
    taskId: row.task_id ?? null,
    taskTitle: row.task_title ?? null,
    mode: row.mode as TimerMode,
    duration: row.duration,
    completed: row.completed,
    startedAt: new Date(row.started_at).getTime(),
    endedAt: row.ended_at ? new Date(row.ended_at).getTime() : new Date(row.started_at).getTime() + row.duration * 1000
  };
}

function sessionToInsert(session: PomodoroSession, userId: string): SessionInsert {
  return {
    id: session.id,
    user_id: userId,
    task_id: session.taskId,
    task_title: session.taskTitle,
    mode: session.mode,
    duration: session.duration,
    completed: session.completed,
    started_at: new Date(session.startedAt).toISOString(),
    ended_at: session.endedAt ? new Date(session.endedAt).toISOString() : null
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePomodoroSessions() {
  const { user, isGuest } = useAuth();
  const userId = user?.id ?? null;

  // --- Modo guest: localStorage ---
  const { value: localState, setValue: setLocalState } =
    useLocalStorage<PomodoroSessionsState>(STORAGE_KEY, defaultState);

  // --- Modo autenticado: Supabase ---
  const [dbSessions, setDbSessions] = useState<PomodoroSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sessions = isGuest ? (localState?.sessions ?? []) : dbSessions;

  /** Atualiza React state + cache de forma atômica */
  const setDbWithCache = (updater: (prev: PomodoroSession[]) => PomodoroSession[]) => {
    setDbSessions((prev) => {
      const next = updater(prev);
      sessionCache.update(next);
      return next;
    });
  };

  // Carrega do Supabase ao montar (usa cache entre navegações)
  useEffect(() => {
    let cancelled = false;

    if (isGuest) { setIsLoading(false); return; }
    if (!userId) return;

    const cached = sessionCache.get(userId);
    if (cached) { setDbSessions(cached); setIsLoading(false); return; }

    setIsLoading(true);
    pomodoroService
      .getSessions(userId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(rowToSession);
        sessionCache.set(userId, mapped);
        setDbSessions(mapped);
      })
      .catch((err) => { if (!cancelled) console.error("[usePomodoroSessions] load:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [userId, isGuest]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const addSession = useCallback(
    (session: Omit<PomodoroSession, "id">) => {
      const newSession: PomodoroSession = { ...session, id: generateId() };

      if (isGuest) {
        setLocalState((prev) => ({
          sessions: [...(prev?.sessions ?? []), newSession]
        }));
      } else {
        setDbWithCache((prev) => [...prev, newSession]);
        if (userId) {
          pomodoroService
            .createSession(sessionToInsert(newSession, userId))
            .catch((err) => console.error("[usePomodoroSessions] create:", err));
        }
      }

      return newSession;
    },
    [isGuest, userId, setLocalState]
  );

  const getSessionsByTask = useCallback(
    (taskId: string): PomodoroSession[] =>
      sessions.filter((s) => s.taskId === taskId),
    [sessions]
  );

  const getStats = useCallback(
    (period: StatsPeriod, customSessions?: PomodoroSession[]): PomodoroStats => {
      const startTime = getPeriodStartTime(period);
      const source = customSessions || sessions;
      const filtered = source.filter((s) => s.startedAt >= startTime);
      const workSessions = filtered.filter((s) => s.mode === "work");
      const breakSessions = filtered.filter(
        (s) => s.mode === "shortBreak" || s.mode === "longBreak"
      );
      const totalWorkTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
      const totalBreakTime = breakSessions.reduce((acc, s) => acc + s.duration, 0);
      const completedSessions = filtered.filter((s) => s.completed).length;
      const completedWorkSessions = workSessions.filter((s) => s.completed).length;

      return {
        period,
        totalSessions: filtered.length,
        completedSessions,
        totalWorkTime,
        totalBreakTime,
        completedCycles: completedWorkSessions,
        averageSessionLength:
          completedSessions > 0 ? Math.round(totalWorkTime / completedSessions) : 0
      };
    },
    [sessions]
  );

  const getTaskStats = useCallback(
    (taskId: string): TaskPomodoroStats => {
      const taskSessions = sessions.filter((s) => s.taskId === taskId);
      const workSessions = taskSessions.filter((s) => s.mode === "work");
      return {
        taskId,
        totalSessions: taskSessions.length,
        completedSessions: taskSessions.filter((s) => s.completed).length,
        totalTimeSpent: workSessions.reduce((acc, s) => acc + s.duration, 0),
        completedPomodoros: workSessions.filter((s) => s.completed).length
      };
    },
    [sessions]
  );

  const clearSessions = useCallback(() => {
    if (isGuest) {
      setLocalState({ sessions: [] });
    } else {
      setDbWithCache(() => []);
      // Nota: não deletamos do Supabase para preservar histórico
    }
  }, [isGuest, setLocalState]);

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, 10),
    [sessions]
  );

  const importSessions = useCallback(
    (importedSessions: PomodoroSession[], mode: "merge" | "replace" = "merge") => {
      const updater = (prev: PomodoroSession[]) => {
        if (mode === "replace") return importedSessions;
        const existingIds = new Set(prev.map((s) => s.id));
        const newSessions = importedSessions.filter((s) => !existingIds.has(s.id));
        return [...newSessions, ...prev];
      };

      if (isGuest) {
        setLocalState((prev) => ({ sessions: updater(prev?.sessions ?? []) }));
      } else {
        setDbWithCache(updater);
      }
    },
    [isGuest, setLocalState]
  );

  return {
    sessions,
    isLoading,
    recentSessions,
    addSession,
    getSessionsByTask,
    getStats,
    getTaskStats,
    clearSessions,
    importSessions
  };
}

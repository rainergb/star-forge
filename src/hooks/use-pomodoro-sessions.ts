import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  PomodoroSession,
  PomodoroSessionsState,
  PomodoroStats,
  StatsPeriod,
  TaskPomodoroStats
} from "@/types/pomodoro.types";

const STORAGE_KEY = "star-habit-pomodoro-sessions";

const defaultState: PomodoroSessionsState = {
  sessions: []
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

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

export function usePomodoroSessions() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<PomodoroSessionsState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };

  const addSession = useCallback(
    (session: Omit<PomodoroSession, "id">) => {
      const newSession: PomodoroSession = {
        ...session,
        id: generateId()
      };
      setState((prev) => ({
        sessions: [...prev.sessions, newSession]
      }));
      return newSession;
    },
    [setState]
  );

  const getSessionsByTask = useCallback(
    (taskId: string): PomodoroSession[] => {
      return state.sessions.filter((session) => session.taskId === taskId);
    },
    [state.sessions]
  );

  const getStats = useCallback(
    (period: StatsPeriod): PomodoroStats => {
      const startTime = getPeriodStartTime(period);
      const filteredSessions = state.sessions.filter(
        (session) => session.startedAt >= startTime
      );

      const workSessions = filteredSessions.filter((s) => s.mode === "work");
      const breakSessions = filteredSessions.filter(
        (s) => s.mode === "shortBreak" || s.mode === "longBreak"
      );

      const totalWorkTime = workSessions.reduce((acc, s) => acc + s.duration, 0);
      const totalBreakTime = breakSessions.reduce((acc, s) => acc + s.duration, 0);
      const completedSessions = filteredSessions.filter((s) => s.completed).length;
      const completedWorkSessions = workSessions.filter((s) => s.completed).length;

      return {
        period,
        totalSessions: filteredSessions.length,
        completedSessions,
        totalWorkTime,
        totalBreakTime,
        completedCycles: completedWorkSessions,
        averageSessionLength:
          completedSessions > 0
            ? Math.round(totalWorkTime / completedSessions)
            : 0
      };
    },
    [state.sessions]
  );

  const getTaskStats = useCallback(
    (taskId: string): TaskPomodoroStats => {
      const taskSessions = getSessionsByTask(taskId);
      const workSessions = taskSessions.filter((s) => s.mode === "work");

      return {
        taskId,
        totalSessions: taskSessions.length,
        completedSessions: taskSessions.filter((s) => s.completed).length,
        totalTimeSpent: workSessions.reduce((acc, s) => acc + s.duration, 0),
        completedPomodoros: workSessions.filter((s) => s.completed).length
      };
    },
    [getSessionsByTask]
  );

  const clearSessions = useCallback(() => {
    setState({ sessions: [] });
  }, [setState]);

  const recentSessions = useMemo(() => {
    return [...state.sessions]
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, 10);
  }, [state.sessions]);

  return {
    sessions: state.sessions,
    recentSessions,
    addSession,
    getSessionsByTask,
    getStats,
    getTaskStats,
    clearSessions
  };
}

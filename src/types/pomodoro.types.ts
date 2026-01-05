export type TimerMode = "work" | "shortBreak" | "longBreak";

export interface ActiveTask {
  id: string;
  title: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: TimerMode;
  duration: number;
  completed: boolean;
  startedAt: number;
  endedAt: number;
}

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  completedCycles: number;
  hasStarted: boolean;
  isTestMode: boolean;
  linkedTaskId: string | null;
}

export interface PomodoroSessionsState {
  sessions: PomodoroSession[];
}

export type StatsPeriod = "day" | "week" | "month" | "year" | "all";

export interface PomodoroStats {
  period: StatsPeriod;
  totalSessions: number;
  completedSessions: number;
  totalWorkTime: number;
  totalBreakTime: number;
  completedCycles: number;
  averageSessionLength: number;
}

export interface TaskPomodoroStats {
  taskId: string;
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number;
  completedPomodoros: number;
}

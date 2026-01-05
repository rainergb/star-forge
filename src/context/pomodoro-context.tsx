import { createContext, useContext, ReactNode } from "react";
import { usePomodoroTimer, TimerMode } from "@/content/pomodoro/use-pomodoro-timer";
import { Task } from "@/types/task.types";
import { ActiveTask } from "@/types/pomodoro.types";

interface PomodoroContextValue {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  completedCycles: number;
  hasStarted: boolean;
  isTestMode: boolean;
  activeTask: ActiveTask | null;
  tasks: Task[];
  toggleTimer: () => void;
  resetTimer: () => void;
  startBreak: () => void;
  startWork: () => void;
  toggleTestMode: () => void;
  formatTime: (seconds: number) => string;
  isWorkMode: boolean;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const pomodoroState = usePomodoroTimer();

  return (
    <PomodoroContext.Provider value={pomodoroState}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoroContext() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoroContext must be used within PomodoroProvider");
  }
  return context;
}

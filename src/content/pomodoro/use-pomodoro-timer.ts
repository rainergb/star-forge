import { useState, useEffect, useRef, useCallback } from "react";
import { useConfig } from "@/hooks/use-config";

export type TimerMode = "work" | "shortBreak" | "longBreak";

export function usePomodoroTimer() {
  const { settings } = useConfig();
  
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [completedCycles, setCompletedCycles] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const prevPomodoroRef = useRef(settings.pomodoro);
  const prevShortBreakRef = useRef(settings.shortBreak);
  const prevLongBreakRef = useRef(settings.longBreak);

  const getTimeForMode = useCallback(
    (targetMode: TimerMode, testMode: boolean): number => {
      if (testMode) return 1;

      switch (targetMode) {
        case "work":
          return settings.pomodoro * 60;
        case "shortBreak":
          return settings.shortBreak * 60;
        case "longBreak":
          return settings.longBreak * 60;
      }
    },
    [settings.pomodoro, settings.shortBreak, settings.longBreak]
  );

  const getNextBreakMode = useCallback(
    (cycles: number): TimerMode => {
      return cycles % settings.longBreakInterval === 0
        ? "longBreak"
        : "shortBreak";
    },
    [settings.longBreakInterval]
  );

  useEffect(() => {
    const settingsChanged =
      prevPomodoroRef.current !== settings.pomodoro ||
      prevShortBreakRef.current !== settings.shortBreak ||
      prevLongBreakRef.current !== settings.longBreak;

    if (settingsChanged && !hasStarted) {
      setTimeLeft(getTimeForMode(mode, isTestMode));
      endTimeRef.current = null;
    }

    prevPomodoroRef.current = settings.pomodoro;
    prevShortBreakRef.current = settings.shortBreak;
    prevLongBreakRef.current = settings.longBreak;
  }, [
    settings.pomodoro,
    settings.shortBreak,
    settings.longBreak,
    mode,
    isTestMode,
    hasStarted,
    getTimeForMode
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        if (endTimeRef.current) {
          const now = Date.now();
          const diff = Math.ceil((endTimeRef.current - now) / 1000);
          setTimeLeft(diff > 0 ? diff : 0);
        }
      }, 100);
    } else if (timeLeft === 0) {
      setIsActive(false);
      endTimeRef.current = null;
      
      if (mode === "work") {
        const newCycles = completedCycles + 1;
        setCompletedCycles(newCycles);
        
        const nextMode = getNextBreakMode(newCycles);
        setMode(nextMode);
        setTimeLeft(getTimeForMode(nextMode, isTestMode));
        
        if (settings.autoStartBreaks) {
          setIsActive(true);
        }
      } else {
        setMode("work");
        setTimeLeft(getTimeForMode("work", isTestMode));
        
        if (settings.autoStartPomodoros) {
          setIsActive(true);
        }
      }
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedCycles, isTestMode, settings.autoStartBreaks, settings.autoStartPomodoros, getTimeForMode, getNextBreakMode]);

  const toggleTimer = useCallback(() => {
    if (!isActive && mode === "work") {
      setHasStarted(true);
    }
    setIsActive(!isActive);
  }, [isActive, mode]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setCompletedCycles(0);
    setHasStarted(false);
    setTimeLeft(getTimeForMode("work", isTestMode));
    endTimeRef.current = null;
  }, [getTimeForMode, isTestMode]);

  const startBreak = useCallback(() => {
    setIsActive(false);
    const breakMode = getNextBreakMode(completedCycles);
    setMode(breakMode);
    setTimeLeft(getTimeForMode(breakMode, isTestMode));
    endTimeRef.current = null;
    setIsActive(true);
  }, [completedCycles, getTimeForMode, getNextBreakMode, isTestMode]);

  const startWork = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setHasStarted(true);
    setTimeLeft(getTimeForMode("work", isTestMode));
    endTimeRef.current = null;
    setIsActive(true);
  }, [getTimeForMode, isTestMode]);

  const toggleTestMode = useCallback(() => {
    const newTestMode = !isTestMode;
    setIsTestMode(newTestMode);
    endTimeRef.current = null;
    setTimeLeft(getTimeForMode(mode, newTestMode));
  }, [isTestMode, mode, getTimeForMode]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeLeft,
    isActive,
    mode,
    completedCycles,
    hasStarted,
    isTestMode,
    toggleTimer,
    resetTimer,
    startBreak,
    startWork,
    toggleTestMode,
    formatTime,
    isWorkMode: mode === "work"
  };
}

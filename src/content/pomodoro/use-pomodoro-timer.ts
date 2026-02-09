import { useState, useEffect, useRef, useCallback } from "react";
import { useConfig } from "@/hooks/use-config";
import { usePersonalize } from "@/hooks/use-personalize";
import { useActiveTask } from "@/hooks/use-active-task";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";
import notificationSound from "@/assets/notification.mp3";
import successSound from "@/assets/sucess.mp3";

export type TimerMode = "work" | "shortBreak" | "longBreak";

export function usePomodoroTimer() {
  const { settings } = useConfig();
  const { settings: personalizeSettings } = usePersonalize();
  const { activeTask, clearActiveTask } = useActiveTask();
  const { addSession } = usePomodoroSessions();
  const { incrementPomodoro, addTimeSpent, tasks, getTask } = useTasks();
  const {
    incrementPomodoro: incrementProjectPomodoro,
    addTimeSpent: addProjectTimeSpent
  } = useProjects();
  const { addTimeToMultiple: addTimeToSkills } = useSkills();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const notificationRepeatRef = useRef<number>(1);

  const activeTaskRef = useRef(activeTask);
  const incrementPomodoroRef = useRef(incrementPomodoro);
  const addTimeSpentRef = useRef(addTimeSpent);
  const addSessionRef = useRef(addSession);
  const incrementProjectPomodoroRef = useRef(incrementProjectPomodoro);
  const addProjectTimeSpentRef = useRef(addProjectTimeSpent);
  const getTaskRef = useRef(getTask);
  const addTimeToSkillsRef = useRef(addTimeToSkills);

  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);

  useEffect(() => {
    incrementPomodoroRef.current = incrementPomodoro;
  }, [incrementPomodoro]);

  useEffect(() => {
    addTimeSpentRef.current = addTimeSpent;
  }, [addTimeSpent]);

  useEffect(() => {
    addSessionRef.current = addSession;
  }, [addSession]);

  useEffect(() => {
    incrementProjectPomodoroRef.current = incrementProjectPomodoro;
  }, [incrementProjectPomodoro]);

  useEffect(() => {
    addProjectTimeSpentRef.current = addProjectTimeSpent;
  }, [addProjectTimeSpent]);

  useEffect(() => {
    getTaskRef.current = getTask;
  }, [getTask]);

  useEffect(() => {
    addTimeToSkillsRef.current = addTimeToSkills;
  }, [addTimeToSkills]);

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    startAudioRef.current = new Audio(successSound);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = personalizeSettings.notificationVolume / 100;
    }
    if (startAudioRef.current) {
      startAudioRef.current.volume =
        personalizeSettings.notificationVolume / 100;
    }
    notificationRepeatRef.current = personalizeSettings.notificationRepeat ?? 1;
  }, [
    personalizeSettings.notificationVolume,
    personalizeSettings.notificationRepeat
  ]);

  const playStartSound = useCallback(() => {
    if (startAudioRef.current && personalizeSettings.notificationSound) {
      startAudioRef.current.currentTime = 0;
      startAudioRef.current.play().catch(() => {});
    }
  }, [personalizeSettings.notificationSound]);

  const playNotification = useCallback(() => {
    if (audioRef.current && personalizeSettings.notificationSound) {
      const repeatCount = notificationRepeatRef.current;
      let currentRepeat = 0;

      const playSound = () => {
        if (currentRepeat < repeatCount && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
          currentRepeat++;
          if (currentRepeat < repeatCount) {
            setTimeout(playSound, audioRef.current.duration * 1000 + 500);
          }
        }
      };

      playSound();
    }
  }, [personalizeSettings.notificationSound]);

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
      playNotification();

      const sessionDuration = sessionStartRef.current
        ? Math.round((Date.now() - sessionStartRef.current) / 1000)
        : mode === "work"
          ? settings.pomodoro * 60
          : mode === "shortBreak"
            ? settings.shortBreak * 60
            : settings.longBreak * 60;

      // Usar refs para evitar stale closures
      const currentActiveTask = activeTaskRef.current;

      addSessionRef.current({
        taskId: currentActiveTask?.id || null,
        taskTitle: currentActiveTask?.title || null,
        mode,
        duration: sessionDuration,
        completed: true,
        startedAt:
          sessionStartRef.current || Date.now() - sessionDuration * 1000,
        endedAt: Date.now()
      });

      if (mode === "work") {
        if (currentActiveTask) {
          incrementPomodoroRef.current(currentActiveTask.id);
          addTimeSpentRef.current(currentActiveTask.id, sessionDuration);

          const task = getTaskRef.current(currentActiveTask.id);
          if (task?.projectId) {
            incrementProjectPomodoroRef.current(task.projectId);
            addProjectTimeSpentRef.current(task.projectId, sessionDuration);
          }

          // Add time to linked skills
          if (task?.skillIds && task.skillIds.length > 0) {
            addTimeToSkillsRef.current(task.skillIds, sessionDuration);
          }
        }

        const newCycles = completedCycles + 1;
        setCompletedCycles(newCycles);

        const nextMode = getNextBreakMode(newCycles);
        setMode(nextMode);
        setTimeLeft(getTimeForMode(nextMode, isTestMode));
        sessionStartRef.current = null;

        if (settings.autoStartBreaks) {
          setIsActive(true);
          sessionStartRef.current = Date.now();
        }
      } else {
        setMode("work");
        setTimeLeft(getTimeForMode("work", isTestMode));
        sessionStartRef.current = null;

        if (settings.autoStartPomodoros) {
          setIsActive(true);
          sessionStartRef.current = Date.now();
        }
      }
    } else {
      endTimeRef.current = null;
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    mode,
    completedCycles,
    isTestMode,
    settings.autoStartBreaks,
    settings.autoStartPomodoros,
    settings.pomodoro,
    settings.shortBreak,
    settings.longBreak,
    getTimeForMode,
    getNextBreakMode,
    playNotification
  ]);

  const toggleTimer = useCallback(() => {
    if (!isActive && mode === "work") {
      setHasStarted(true);
      playStartSound();
    }
    if (!isActive) {
      sessionStartRef.current = Date.now();
    }
    setIsActive(!isActive);
  }, [isActive, mode, playStartSound]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setCompletedCycles(0);
    setHasStarted(false);
    setTimeLeft(getTimeForMode("work", isTestMode));
    endTimeRef.current = null;
    sessionStartRef.current = null;
    clearActiveTask();
  }, [getTimeForMode, isTestMode, clearActiveTask]);

  const startBreak = useCallback(() => {
    setIsActive(false);
    const breakMode = getNextBreakMode(completedCycles);
    setMode(breakMode);
    setTimeLeft(getTimeForMode(breakMode, isTestMode));
    endTimeRef.current = null;
    sessionStartRef.current = Date.now();
    setIsActive(true);
  }, [completedCycles, getTimeForMode, getNextBreakMode, isTestMode]);

  const startWork = useCallback(() => {
    setIsActive(false);
    setMode("work");
    setHasStarted(true);
    setTimeLeft(getTimeForMode("work", isTestMode));
    endTimeRef.current = null;
    sessionStartRef.current = Date.now();
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  return {
    timeLeft,
    isActive,
    mode,
    completedCycles,
    hasStarted,
    isTestMode,
    activeTask,
    tasks,
    toggleTimer,
    resetTimer,
    startBreak,
    startWork,
    toggleTestMode,
    formatTime,
    isWorkMode: mode === "work"
  };
}

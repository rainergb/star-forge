import { useCallback } from "react";
import { CalendarDayData, CalendarModule, CalendarMonthData } from "@/types/calendar.types";
import { useDiary } from "./use-diary";
import { useTasks } from "./use-tasks";
import { useProjects } from "./use-projects";
import { useSkills } from "./use-skills";
import { usePomodoroSessions } from "./use-pomodoro-sessions";
import { useMood } from "./use-mood";

export function useCalendarData(module: CalendarModule) {
  const { entries } = useDiary();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { skills } = useSkills();
  const { sessions } = usePomodoroSessions();
  const { getEmojiForAverage, getColorForAverage } = useMood();

  const getDiaryDayData = useCallback((date: string): CalendarDayData | undefined => {
    const dayEntries = entries.filter((e) => e.date === date);
    if (dayEntries.length === 0) return undefined;

    const moodsWithLevel = dayEntries.filter((e) => e.mood?.level);
    const avgMood = moodsWithLevel.length > 0
      ? moodsWithLevel.reduce((sum, e) => sum + (e.mood?.level || 0), 0) / moodsWithLevel.length
      : null;

    const emoji = avgMood ? getEmojiForAverage(avgMood) : null;

    return {
      date,
      hasData: true,
      indicator: emoji ? {
        type: "mood",
        value: emoji,
        color: getColorForAverage(avgMood!)
      } : {
        type: "count",
        value: dayEntries.length
      },
      tooltip: `${dayEntries.length} ${dayEntries.length === 1 ? "entry" : "entries"}`
    };
  }, [entries, getEmojiForAverage, getColorForAverage]);

  const getTasksDayData = useCallback((date: string): CalendarDayData | undefined => {
    const dayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;
      return taskDateStr === date;
    });

    if (dayTasks.length === 0) return undefined;

    const completed = dayTasks.filter((t) => t.completed).length;
    const total = dayTasks.length;

    return {
      date,
      hasData: true,
      indicator: {
        type: "count",
        value: total,
        color: completed === total ? "#22c55e" : "#8b5cf6"
      },
      tooltip: `${completed}/${total} tasks completed`
    };
  }, [tasks]);

  const getPomodoroDayData = useCallback((date: string): CalendarDayData | undefined => {
    const daySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.startedAt);
      const sessionDateStr = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, "0")}-${String(sessionDate.getDate()).padStart(2, "0")}`;
      return sessionDateStr === date && s.completed;
    });

    if (daySessions.length === 0) return undefined;

    const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    return {
      date,
      hasData: true,
      indicator: {
        type: "count",
        value: daySessions.length,
        color: "#f97316"
      },
      tooltip: `${daySessions.length} sessions (${hours > 0 ? `${hours}h ` : ""}${mins}m)`
    };
  }, [sessions]);

  const getProjectsDayData = useCallback((date: string): CalendarDayData | undefined => {
    // Check for project deadlines (dueDate) or activity
    const projectsWithDueDate = projects.filter((p) => {
      if (!p.dueDate) return false;
      const dueDateObj = new Date(p.dueDate);
      const dueDateStr = `${dueDateObj.getFullYear()}-${String(dueDateObj.getMonth() + 1).padStart(2, "0")}-${String(dueDateObj.getDate()).padStart(2, "0")}`;
      return dueDateStr === date;
    });

    if (projectsWithDueDate.length === 0) return undefined;

    return {
      date,
      hasData: true,
      indicator: {
        type: "dot",
        value: projectsWithDueDate.length,
        color: "#3b82f6"
      },
      tooltip: `${projectsWithDueDate.length} project deadline${projectsWithDueDate.length > 1 ? "s" : ""}`
    };
  }, [projects]);

  const getMaestryDayData = useCallback((date: string): CalendarDayData | undefined => {
    // Check skills that were updated on this day (as a proxy for practice)
    const practiceCount = skills.filter((skill) => {
      const updatedDate = new Date(skill.updatedAt);
      const updatedDateStr = `${updatedDate.getFullYear()}-${String(updatedDate.getMonth() + 1).padStart(2, "0")}-${String(updatedDate.getDate()).padStart(2, "0")}`;
      return updatedDateStr === date && skill.totalTimeSpent > 0;
    }).length;

    if (practiceCount === 0) return undefined;

    return {
      date,
      hasData: true,
      indicator: {
        type: "count",
        value: practiceCount,
        color: "#a855f7"
      },
      tooltip: `${practiceCount} skill${practiceCount > 1 ? "s" : ""} active`
    };
  }, [skills]);

  const getStatsDayData = useCallback((date: string): CalendarDayData | undefined => {
    // Aggregate activity from all modules
    const diaryData = getDiaryDayData(date);
    const tasksData = getTasksDayData(date);
    const pomodoroData = getPomodoroDayData(date);

    const activityCount = [diaryData, tasksData, pomodoroData].filter(Boolean).length;
    if (activityCount === 0) return undefined;

    // Activity level based on data sources
    const level = Math.min(100, activityCount * 33);

    return {
      date,
      hasData: true,
      indicator: {
        type: "progress",
        value: level,
        color: level > 66 ? "#22c55e" : level > 33 ? "#eab308" : "#6b7280"
      },
      tooltip: `Activity level: ${level}%`
    };
  }, [getDiaryDayData, getTasksDayData, getPomodoroDayData]);

  const getDayData = useCallback((date: string): CalendarDayData | undefined => {
    switch (module) {
      case "diary":
        return getDiaryDayData(date);
      case "tasks":
        return getTasksDayData(date);
      case "pomodoro":
        return getPomodoroDayData(date);
      case "projects":
        return getProjectsDayData(date);
      case "maestry":
        return getMaestryDayData(date);
      case "stats":
        return getStatsDayData(date);
      default:
        return undefined;
    }
  }, [module, getDiaryDayData, getTasksDayData, getPomodoroDayData, getProjectsDayData, getMaestryDayData, getStatsDayData]);

  const getMonthData = useCallback((month: string): CalendarMonthData => {
    const [year, monthNum] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const days: CalendarDayData[] = [];
    let daysWithData = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayData = getDayData(dateStr);
      if (dayData) {
        days.push(dayData);
        daysWithData++;
      }
    }

    return {
      month,
      days,
      summary: {
        totalDays: daysInMonth,
        daysWithData
      }
    };
  }, [getDayData]);

  return {
    getDayData,
    getMonthData
  };
}

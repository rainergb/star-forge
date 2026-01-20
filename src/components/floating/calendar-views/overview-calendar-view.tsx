import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, BookOpen, Timer } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useDiary } from "@/hooks/use-diary";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useMood } from "@/hooks/use-mood";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OverviewCalendarViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function OverviewCalendarView({
  selectedDate,
  onSelectDate
}: OverviewCalendarViewProps) {
  const { entries } = useDiary();
  const { tasks } = useTasks();
  const { sessions } = usePomodoroSessions();
  const { getEmojiForAverage } = useMood();

  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const goToPrevWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(formatDateStr(now));
  };

  const getDayData = (date: Date) => {
    const dateStr = formatDateStr(date);
    
    // Tasks
    const dayTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      const taskDate = new Date(t.dueDate);
      return formatDateStr(taskDate) === dateStr;
    });
    
    // Pomodoro sessions
    const daySessions = sessions.filter(s => {
      const sessionDate = new Date(s.startedAt);
      return formatDateStr(sessionDate) === dateStr && s.completed;
    });
    
    // Diary entries
    const dayEntries = entries.filter(e => e.date === dateStr);
    
    // Mood average
    const moodsWithLevel = dayEntries.filter(e => e.mood?.level);
    const avgMood = moodsWithLevel.length > 0
      ? moodsWithLevel.reduce((sum, e) => sum + (e.mood?.level || 0), 0) / moodsWithLevel.length
      : null;

    return {
      tasks: dayTasks,
      completedTasks: dayTasks.filter(t => t.completed).length,
      totalTasks: dayTasks.length,
      sessions: daySessions,
      totalFocusTime: daySessions.reduce((sum, s) => sum + s.duration, 0),
      entries: dayEntries,
      moodEmoji: avgMood ? getEmojiForAverage(avgMood) : null
    };
  };

  const selectedDayData = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return getDayData(new Date(year, month - 1, day));
  }, [selectedDate, tasks, sessions, entries]);

  const weeklyStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalSessions = 0;
    let totalFocusTime = 0;
    let totalEntries = 0;

    weekDays.forEach(day => {
      const data = getDayData(day);
      totalTasks += data.totalTasks;
      completedTasks += data.completedTasks;
      totalSessions += data.sessions.length;
      totalFocusTime += data.totalFocusTime;
      totalEntries += data.entries.length;
    });

    return { totalTasks, completedTasks, totalSessions, totalFocusTime, totalEntries };
  }, [weekDays, tasks, sessions, entries]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Weekly Overview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Tasks</span>
            </div>
            <div className="text-2xl font-bold">
              {weeklyStats.completedTasks}/{weeklyStats.totalTasks}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Timer className="w-4 h-4" />
              <span>Pomodoros</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalSessions}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span>Focus Time</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.floor(weeklyStats.totalFocusTime / 60)}h {weeklyStats.totalFocusTime % 60}m
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Diary</span>
            </div>
            <div className="text-2xl font-bold">{weeklyStats.totalEntries}</div>
          </div>
        </div>
      </div>

      {/* Week days row */}
      <div className="grid grid-cols-7 border-b border-white/10">
        {weekDays.map((day, index) => {
          const dateStr = formatDateStr(day);
          const isSelected = dateStr === selectedDate;
          const isToday = isSameDay(day, new Date());
          const dayData = getDayData(day);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "p-3 text-center transition-colors border-r border-white/5 last:border-r-0",
                isSelected
                  ? "bg-primary/20"
                  : isToday
                    ? "bg-white/5"
                    : "hover:bg-white/5"
              )}
            >
              <div className="text-xs text-white/40 mb-1">{WEEKDAYS[index]}</div>
              <div className={cn(
                "text-lg font-medium mb-2",
                isSelected ? "text-primary" : isToday ? "text-white" : "text-white/70"
              )}>
                {day.getDate()}
              </div>
              <div className="flex flex-col items-center gap-1">
                {dayData.moodEmoji && (
                  <span className="text-sm">{dayData.moodEmoji}</span>
                )}
                {dayData.totalTasks > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/50">
                    <CheckCircle2 className="w-3 h-3" />
                    {dayData.completedTasks}/{dayData.totalTasks}
                  </div>
                )}
                {dayData.sessions.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-400/70">
                    <Timer className="w-3 h-3" />
                    {dayData.sessions.length}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {format(new Date(selectedDate.replace(/-/g, "/")), "EEEE, MMMM d")}
          </h3>

          {/* Tasks section */}
          {selectedDayData.totalTasks > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Tasks ({selectedDayData.completedTasks}/{selectedDayData.totalTasks})
              </h4>
              <div className="space-y-2">
                {selectedDayData.tasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      task.completed && "text-white/50 line-through"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      task.completed ? "bg-green-500" : "bg-primary"
                    )} />
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pomodoro section */}
          {selectedDayData.sessions.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-orange-400" />
                Pomodoro Sessions ({selectedDayData.sessions.length})
              </h4>
              <div className="space-y-2">
                {selectedDayData.sessions.map(session => (
                  <div key={session.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/70">
                      {session.taskTitle || "Focus session"}
                    </span>
                    <span className="text-white/50">{session.duration} min</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
                Total: {Math.floor(selectedDayData.totalFocusTime / 60)}h {selectedDayData.totalFocusTime % 60}m
              </div>
            </div>
          )}

          {/* Diary section */}
          {selectedDayData.entries.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white/60 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Diary Entries ({selectedDayData.entries.length})
                {selectedDayData.moodEmoji && (
                  <span className="ml-auto text-lg">{selectedDayData.moodEmoji}</span>
                )}
              </h4>
              <div className="space-y-2">
                {selectedDayData.entries.map(entry => (
                  <div key={entry.id} className="text-sm">
                    <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                      {entry.time && <span>{entry.time}</span>}
                      {entry.mood?.emoji && <span>{entry.mood.emoji}</span>}
                    </div>
                    <p className="text-white/70 line-clamp-2">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {selectedDayData.totalTasks === 0 && 
           selectedDayData.sessions.length === 0 && 
           selectedDayData.entries.length === 0 && (
            <div className="text-center text-white/40 py-8">
              No activity recorded for this day
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

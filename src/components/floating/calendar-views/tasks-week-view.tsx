import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@/types/task.types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TasksWeekViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

export function TasksWeekView({
  selectedDate,
  onSelectDate
}: TasksWeekViewProps) {
  const { tasks } = useTasks();

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
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(formatDateStr(now));
  };

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    weekDays.forEach(day => {
      const dateStr = formatDateStr(day);
      grouped[dateStr] = tasks.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = new Date(t.dueDate);
        return formatDateStr(taskDate) === dateStr;
      }).sort((a, b) => {
        // Sort by due date time if available
        if (a.dueDate && b.dueDate) {
          return a.dueDate - b.dueDate;
        }
        return 0;
      });
    });

    return grouped;
  }, [tasks, weekDays]);

  // Tasks without specific time (all-day tasks)
  const getTasksForHour = (dateStr: string, hour: number) => {
    return tasksByDay[dateStr]?.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.getHours() === hour;
    }) || [];
  };

  const getAllDayTasks = (dateStr: string) => {
    return tasksByDay[dateStr]?.filter(task => {
      if (!task.dueDate) return true; // No specific time
      const taskDate = new Date(task.dueDate);
      // Consider tasks at midnight or with no specific time as all-day
      return taskDate.getHours() === 0;
    }) || [];
  };

  const getTaskColor = (task: Task) => {
    if (task.completed) return "bg-green-500/20 border-green-500/50 text-green-300";
    if (task.projectId) return "bg-blue-500/20 border-blue-500/50 text-blue-300";
    return "bg-primary/20 border-primary/50 text-primary-foreground";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
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
      </div>

      {/* Calendar grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b border-white/10">
          <div className="p-2 text-center text-xs text-white/40 border-r border-white/5">
            GMT
          </div>
          {weekDays.map((day) => {
            const dateStr = formatDateStr(day);
            const isSelected = dateStr === selectedDate;
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  "p-2 text-center transition-colors border-r border-white/5 last:border-r-0",
                  isSelected && "bg-primary/10"
                )}
              >
                <div className="text-xs text-white/40">{format(day, "EEE")}</div>
                <div className={cn(
                  "text-lg font-medium mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto",
                  isToday && "bg-primary text-white",
                  isSelected && !isToday && "text-primary"
                )}>
                  {day.getDate()}
                </div>
              </button>
            );
          })}
        </div>

        {/* All-day tasks row */}
        <div className="grid grid-cols-8 border-b border-white/10 min-h-[60px]">
          <div className="p-2 text-xs text-white/40 border-r border-white/5 flex items-start">
            All day
          </div>
          {weekDays.map((day) => {
            const dateStr = formatDateStr(day);
            const allDayTasks = getAllDayTasks(dateStr);

            return (
              <div
                key={`allday-${dateStr}`}
                className="p-1 border-r border-white/5 last:border-r-0"
              >
                {allDayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "text-xs px-2 py-1 rounded mb-1 truncate border-l-2",
                      getTaskColor(task)
                    )}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {allDayTasks.length > 3 && (
                  <div className="text-xs text-white/40 px-2">
                    +{allDayTasks.length - 3} more
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r border-white/5">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="h-14 text-xs text-white/40 text-right pr-2 pt-0 -mt-2"
                >
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dateStr = formatDateStr(day);
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={`grid-${dateStr}`}
                  className={cn(
                    "border-r border-white/5 last:border-r-0 relative",
                    isSelected && "bg-primary/5"
                  )}
                >
                  {HOURS.map(hour => {
                    const hourTasks = getTasksForHour(dateStr, hour);

                    return (
                      <div
                        key={`${dateStr}-${hour}`}
                        className="h-14 border-b border-white/5 relative"
                      >
                        {hourTasks.map((task, idx) => (
                          <div
                            key={task.id}
                            className={cn(
                              "absolute left-0.5 right-0.5 px-1 py-0.5 rounded text-xs border-l-2 truncate",
                              getTaskColor(task)
                            )}
                            style={{
                              top: `${idx * 20}px`,
                              minHeight: "18px"
                            }}
                            title={task.title}
                          >
                            <div className="flex items-center gap-1">
                              {task.dueDate && (
                                <span className="text-[10px] opacity-70">
                                  {format(new Date(task.dueDate), "h:mm a")}
                                </span>
                              )}
                            </div>
                            <div className="truncate">{task.title}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Summary footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/60">
            {Object.values(tasksByDay).flat().length} tasks this week
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" /> Pending
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> With Project
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

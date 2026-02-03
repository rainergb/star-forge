import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Folder, CheckCircle2, Circle, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { PROJECT_COLORS } from "@/types/project.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface ProjectsCalendarViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function ProjectsCalendarView({
  selectedDate,
  onSelectDate
}: ProjectsCalendarViewProps) {
  const { tasks } = useTasks();
  const { projects } = useProjects();

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

  // Projects with tasks summary
  const projectsWithStats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status !== "completed");

    return activeProjects.map(project => {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.completed).length;
      const totalTasks = projectTasks.length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Tasks due this week
      const weekTasks = projectTasks.filter(t => {
        if (!t.dueDate) return false;
        const taskDate = new Date(t.dueDate);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      // Tasks by day for this week
      const tasksByDay: Record<string, typeof projectTasks> = {};
      weekDays.forEach(day => {
        const dateStr = formatDateStr(day);
        tasksByDay[dateStr] = projectTasks.filter(t => {
          if (!t.dueDate) return false;
          const taskDate = new Date(t.dueDate);
          return formatDateStr(taskDate) === dateStr;
        });
      });

      // Next deadline
      const upcomingTasks = projectTasks
        .filter(t => !t.completed && t.dueDate && t.dueDate > Date.now())
        .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
      const nextDeadline = upcomingTasks[0]?.dueDate;

      return {
        ...project,
        projectTasks,
        completedTasks,
        totalTasks,
        progress,
        weekTasks,
        tasksByDay,
        nextDeadline
      };
    }).filter(p => p.totalTasks > 0 || p.status === "active");
  }, [projects, tasks, weekDays, weekStart, weekEnd]);

  // Selected day tasks grouped by project
  const selectedDayProjects = useMemo(() => {
    return projectsWithStats.map(project => ({
      ...project,
      dayTasks: project.tasksByDay[selectedDate] || []
    })).filter(p => p.dayTasks.length > 0);
  }, [projectsWithStats, selectedDate]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects Overview</h2>
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

        {/* Week indicator */}
        <div className="text-sm text-white/60">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Projects grid */}
          {projectsWithStats.map(project => {
            const colors = PROJECT_COLORS[project.color];

            return (
              <div
                key={project.id}
                className="bg-white/5 rounded-lg overflow-hidden"
              >
                {/* Project header */}
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${colors.solid}20` }}
                  >
                    <Folder className="w-5 h-5" style={{ color: colors.solid }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{project.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {project.completedTasks}/{project.totalTasks} tasks
                      </span>
                      {project.nextDeadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next: {format(new Date(project.nextDeadline), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: colors.solid }}>
                      {project.progress}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-2">
                  <Progress 
                    value={project.progress} 
                    className="h-1.5"
                    style={{ 
                      backgroundColor: `${colors.solid}20`,
                    }}
                  />
                </div>

                {/* Week tasks grid */}
                <div className="grid grid-cols-7 border-t border-white/5">
                  {weekDays.map((day) => {
                    const dateStr = formatDateStr(day);
                    const dayTasks = project.tasksByDay[dateStr] || [];
                    const isSelected = dateStr === selectedDate;
                    const isToday = isSameDay(day, new Date());
                    const completedCount = dayTasks.filter(t => t.completed).length;

                    return (
                      <button
                        key={`${project.id}-${dateStr}`}
                        onClick={() => onSelectDate(dateStr)}
                        className={cn(
                          "p-2 text-center border-r border-white/5 last:border-r-0 transition-colors",
                          isSelected && "bg-primary/10",
                          !isSelected && "hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "text-xs mb-1",
                          isToday ? "text-primary font-medium" : "text-white/40"
                        )}>
                          {format(day, "EEE")}
                        </div>
                        <div className={cn(
                          "text-sm font-medium",
                          isToday ? "text-white" : "text-white/70"
                        )}>
                          {day.getDate()}
                        </div>
                        {dayTasks.length > 0 && (
                          <div className="mt-1">
                            <div
                              className="text-xs font-medium mx-auto px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: `${colors.solid}20`,
                                color: colors.solid
                              }}
                            >
                              {completedCount}/{dayTasks.length}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Expanded tasks for selected day */}
                {selectedDayProjects.find(p => p.id === project.id) && (
                  <div className="border-t border-white/10 p-3 bg-black/20">
                    <div className="text-xs text-white/50 mb-2">
                      Tasks for {format(new Date(selectedDate.replace(/-/g, "/")), "MMM d")}
                    </div>
                    <div className="space-y-1.5">
                      {project.tasksByDay[selectedDate]?.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30 shrink-0" />
                          )}
                          <span className={cn(
                            "truncate",
                            task.completed && "text-white/50 line-through"
                          )}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-white/40 ml-auto shrink-0">
                              {format(new Date(task.dueDate), "h:mm a")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {projectsWithStats.length === 0 && (
            <div className="text-center text-white/40 py-12">
              <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active projects with tasks</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>{projectsWithStats.length} active projects</span>
          <span>
            {projectsWithStats.reduce((sum, p) => sum + p.weekTasks.length, 0)} tasks this week
          </span>
        </div>
      </div>
    </div>
  );
}

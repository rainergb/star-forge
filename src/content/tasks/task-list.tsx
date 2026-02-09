import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useActiveTask } from "@/hooks/use-active-task";
import { useConfig } from "@/hooks/use-config";
import { useToast } from "@/hooks/use-toast";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { TaskInput } from "./task-input";
import { TaskListContent } from "./task-list-content";
import { TaskDetails } from "./task-details";
import { ProjectFilter } from "./project-filter";
import { PriorityFilter } from "./priority-filter";
import { DateFilter } from "./date-filter";
import { ExportButton } from "@/components/shared/export-button";
import { ImportButton } from "@/components/shared/import-button";
import {
  exportTasks,
  importFromFile,
  validateTasksImport
} from "@/services/export-service";
import { Task, TaskReminder } from "@/types/task.types";
import {
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
  isWithinInterval
} from "date-fns";

interface TaskListProps {
  onNavigateToPomodoro?: () => void;
  compact?: boolean;
  onSelectTask?: (task: Task) => void;
  onClearTask?: () => void;
  initialFilterProjectId?: string | null;
}

export function TaskList({
  onNavigateToPomodoro,
  onSelectTask,
  onClearTask,
  initialFilterProjectId
}: TaskListProps) {
  const {
    tasks,
    addTask,
    toggleCompleted,
    toggleFavorite,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    setDueDate,
    setReminder,
    setRepeat,
    addFile,
    removeFile,
    addNote,
    updateNote,
    removeNote,
    removeTask,
    setEstimatedPomodoros,
    reorderTasks,
    setProject,
    setSkills,
    setPriority,
    importTasks
  } = useTasks();
  const { sessions } = usePomodoroSessions();
  const { activeTask, setActiveTask, clearActiveTask } = useActiveTask();
  const { settings: timerSettings } = useConfig();
  const { toast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);

  const {
    projectIds: filterProjectIds,
    noProject: filterNoProject,
    priorities: filterPriorities,
    dateFilter: filterDate,
    customDateRange,
    hasActiveFilter,
    setProjectFilter,
    setPriorities: setFilterPriorities,
    setDateFilter: setFilterDate,
    setCustomDateRange
  } = useTaskFilters();

  useEffect(() => {
    if (initialFilterProjectId) {
      setProjectFilter([initialFilterProjectId], false);
    }
  }, [initialFilterProjectId, setProjectFilter]);

  const hasActiveProjectFilter = filterProjectIds.length > 0 || filterNoProject;
  const hasActivePriorityFilter = filterPriorities.length > 0;
  const hasActiveDateFilter = filterDate !== "all";

  const matchesDateFilter = (task: Task): boolean => {
    if (filterDate === "all") return true;

    const dueDate = task.dueDate ? new Date(task.dueDate) : null;

    switch (filterDate) {
      case "today":
        return dueDate !== null && isToday(dueDate);
      case "tomorrow":
        return dueDate !== null && isTomorrow(dueDate);
      case "week":
        return dueDate !== null && isThisWeek(dueDate, { weekStartsOn: 0 });
      case "overdue":
        return dueDate !== null && isPast(dueDate) && !isToday(dueDate);
      case "no-date":
        return dueDate === null;
      case "custom":
        if (!customDateRange.start || dueDate === null) return false;
        const endDate = customDateRange.end || customDateRange.start;
        return isWithinInterval(dueDate, {
          start: customDateRange.start,
          end: endDate
        });
      default:
        return true;
    }
  };

  const filterTasks = (taskList: Task[]): Task[] => {
    let filtered = taskList;

    // Filter by project
    if (hasActiveProjectFilter) {
      filtered = filtered.filter((task) => {
        if (filterNoProject && !task.projectId) return true;
        if (filterProjectIds.includes(task.projectId || "")) return true;
        return false;
      });
    }

    // Filter by priority
    if (hasActivePriorityFilter) {
      filtered = filtered.filter((task) =>
        filterPriorities.includes(task.priority)
      );
    }

    // Filter by date
    if (hasActiveDateFilter) {
      filtered = filtered.filter(matchesDateFilter);
    }

    return filtered;
  };

  const allIncompleteTasks = tasks.filter((t) => !t.completed);
  const allCompletedTasks = tasks.filter((t) => t.completed);
  const incompleteTasks = filterTasks(allIncompleteTasks);
  const completedTasks = filterTasks(allCompletedTasks);

  // Get project to inherit when creating new task
  const inheritProjectId =
    filterProjectIds.length === 1 && !filterNoProject
      ? filterProjectIds[0]
      : null;

  const handleAddTask = (
    title: string,
    options: {
      dueDate: number | null;
      reminder: TaskReminder | null;
      estimatedPomodoros: number | null;
    }
  ) => {
    addTask(title, "Tasks", {
      ...options,
      projectId: inheritProjectId
    });
  };

  const handleTaskClick = (task: Task) => {
    if (task.completed) return;
    if (activeTask?.id === task.id) {
      if (onClearTask) {
        onClearTask();
      } else {
        clearActiveTask();
      }
    } else {
      if (onSelectTask) {
        onSelectTask(task);
      } else {
        setActiveTask(task);
      }
    }
  };

  const handleTaskDoubleClick = (task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const handleStartPomodoro = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
      setDetailsOpen(false);
      if (onNavigateToPomodoro) {
        onNavigateToPomodoro();
      }
    }
  };

  const calculateEstimatedEndTime = () => {
    const pomodoroMinutes = timerSettings.pomodoro;
    const shortBreakMinutes = timerSettings.shortBreak;
    const longBreakInterval = timerSettings.longBreakInterval;
    const longBreakMinutes = timerSettings.longBreak;

    let totalMinutes = 0;
    let pomodoroCount = 0;

    incompleteTasks.forEach((task) => {
      const pomodoros = task.estimatedPomodoros ?? 0;
      for (let i = 0; i < pomodoros; i++) {
        totalMinutes += pomodoroMinutes;
        pomodoroCount++;
        if (pomodoroCount % longBreakInterval === 0) {
          totalMinutes += longBreakMinutes;
        } else if (
          i < pomodoros - 1 ||
          incompleteTasks.indexOf(task) < incompleteTasks.length - 1
        ) {
          totalMinutes += shortBreakMinutes;
        }
      }
    });

    if (totalMinutes === 0) return null;

    const now = new Date();
    const endTime = new Date(now.getTime() + totalMinutes * 60 * 1000);
    return endTime;
  };

  const formatEndTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const calculateTaskEndTime = (taskIndex: number): Date | null => {
    const pomodoroMinutes = timerSettings.pomodoro;
    const shortBreakMinutes = timerSettings.shortBreak;
    const longBreakInterval = timerSettings.longBreakInterval;
    const longBreakMinutes = timerSettings.longBreak;

    let totalMinutes = 0;
    let pomodoroCount = 0;

    for (let i = 0; i <= taskIndex; i++) {
      const task = incompleteTasks[i];
      const pomodoros = task.estimatedPomodoros ?? 0;
      for (let j = 0; j < pomodoros; j++) {
        totalMinutes += pomodoroMinutes;
        pomodoroCount++;
        if (pomodoroCount % longBreakInterval === 0) {
          totalMinutes += longBreakMinutes;
        } else if (j < pomodoros - 1 || i < taskIndex) {
          totalMinutes += shortBreakMinutes;
        }
      }
    }

    if (totalMinutes === 0) return null;

    const now = new Date();
    return new Date(now.getTime() + totalMinutes * 60 * 1000);
  };

  const currentTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null;

  const estimatedEndTime = calculateEstimatedEndTime();

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto overflow-hidden">
      <TaskInput onAddTask={handleAddTask} />

      <div className="flex gap-2 w-full mt-2 flex-wrap">
        <ProjectFilter
          selectedProjectIds={filterProjectIds}
          includeNoProject={filterNoProject}
          onSelectionChange={setProjectFilter}
          className="flex-1 min-w-[120px]"
        />
        <PriorityFilter
          selectedPriorities={filterPriorities}
          onSelectionChange={setFilterPriorities}
        />
        <DateFilter
          selectedFilter={filterDate}
          onFilterChange={setFilterDate}
          customRange={customDateRange}
          onCustomRangeChange={setCustomDateRange}
        />
        <div className="flex gap-1">
          <ExportButton
            onExport={() => exportTasks(tasks)}
            tooltip="Export tasks"
          />
          <ImportButton
            onImport={async (file) => {
              const result = await importFromFile(file);
              if (result.success && result.data?.tasks) {
                if (validateTasksImport(result.data.tasks)) {
                  importTasks(result.data.tasks);
                  toast({
                    title: "Import successful",
                    description: `${result.data.tasks.length} tasks imported`
                  });
                } else {
                  toast({
                    title: "Import failed",
                    description: "Invalid tasks format",
                    variant: "destructive"
                  });
                }
              } else {
                toast({
                  title: "Import failed",
                  description: result.message,
                  variant: "destructive"
                });
              }
            }}
            tooltip="Import tasks"
          />
        </div>
      </div>

      <TaskListContent
        tasks={tasks}
        incompleteTasks={incompleteTasks}
        completedTasks={completedTasks}
        activeTaskId={activeTask?.id}
        hasActiveFilter={hasActiveFilter}
        estimatedEndTime={estimatedEndTime}
        completedCollapsed={completedCollapsed}
        onToggleCompletedCollapsed={() =>
          setCompletedCollapsed(!completedCollapsed)
        }
        onToggleCompleted={toggleCompleted}
        onToggleFavorite={toggleFavorite}
        onSetDueDate={setDueDate}
        onRemoveTask={removeTask}
        onTaskClick={handleTaskClick}
        onTaskDoubleClick={handleTaskDoubleClick}
        onReorderTasks={reorderTasks}
        calculateTaskEndTime={calculateTaskEndTime}
        formatEndTime={formatEndTime}
      />

      <TaskDetails
        task={currentTask}
        open={detailsOpen}
        sessions={sessions}
        onOpenChange={setDetailsOpen}
        onToggleCompleted={toggleCompleted}
        onToggleFavorite={toggleFavorite}
        onUpdateTask={updateTask}
        onAddStep={addStep}
        onToggleStep={toggleStep}
        onRemoveStep={removeStep}
        onSetDueDate={setDueDate}
        onSetReminder={setReminder}
        onSetRepeat={setRepeat}
        onAddFile={addFile}
        onRemoveFile={removeFile}
        onAddNote={addNote}
        onUpdateNote={updateNote}
        onRemoveNote={removeNote}
        onRemoveTask={removeTask}
        onSetEstimatedPomodoros={setEstimatedPomodoros}
        onSetProject={setProject}
        onSetSkills={setSkills}
        onSetPriority={setPriority}
        onStartPomodoro={handleStartPomodoro}
      />
    </div>
  );
}

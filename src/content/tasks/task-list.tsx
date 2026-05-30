import { useState, useEffect, useCallback, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useActiveTask } from "@/hooks/use-active-task";
import { useConfig } from "@/hooks/use-config";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { useTaskSort, TASK_SORT_LABELS, TASK_SORT_ICONS } from "@/hooks/use-task-sort";
import type { TaskSortKey } from "@/hooks/use-task-sort";
import { useListLimit } from "@/hooks/use-list-limit";
import { LimitChip, applyLimit } from "@/components/shared/limit-chip";
import { TaskInput } from "./task-input";
import { TaskListSkeleton } from "./task-list-skeleton";
import { TaskListContent } from "./task-list-content";
import { TaskDetails } from "./task-details";
import { ProjectFilter } from "./project-filter";
import { PriorityFilter } from "./priority-filter";
import { DateFilter } from "./date-filter";
import { Task, TaskReminder } from "@/types/task.types";
import {
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
  isWithinInterval
} from "date-fns";
import { ArrowUpDown } from "lucide-react";

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };

interface TaskListProps {
  onNavigateToPomodoro?: () => void;
  compact?: boolean;
  onSelectTask?: (task: Task) => void;
  onClearTask?: () => void;
  initialFilterProjectId?: string | null;
}

export function TaskList({
  onNavigateToPomodoro,
  compact = false,
  onSelectTask,
  onClearTask,
  initialFilterProjectId
}: TaskListProps) {
  const {
    tasks,
    isLoading,
    addTask,
    toggleCompleted,
    toggleFavorite,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    updateStep,
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
    reorderSteps,
    duplicateTask,
    setRepeatDays,
    setProject,
    setSkills,
    setPriority
  } = useTasks();
  const { projects } = useProjects();
  const { sessions } = usePomodoroSessions();
  const { activeTask, setActiveTask, clearActiveTask } = useActiveTask();
  const { settings: timerSettings } = useConfig();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);
  const { sortKey, setSortKey } = useTaskSort();
  const { limit, setLimit } = useListLimit("tasks");

  // Map taskId → total work time (seconds) baseado nas pomodoro sessions
  const taskTimeMap = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach((s) => {
      if (s.taskId && s.mode === "work" && s.completed) {
        map.set(s.taskId, (map.get(s.taskId) ?? 0) + s.duration);
      }
    });
    return map;
  }, [sessions]);

  const applySort = useCallback((list: Task[]) => {
    if (sortKey === "default") return list;
    return [...list].sort((a, b) => {
      if (sortKey === "priority") {
        return (PRIORITY_ORDER[a.priority ?? "none"] ?? 4) - (PRIORITY_ORDER[b.priority ?? "none"] ?? 4);
      }
      if (sortKey === "steps") {
        return (b.steps?.length ?? 0) - (a.steps?.length ?? 0);
      }
      if (sortKey === "due-date") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate - b.dueDate;
      }
      if (sortKey === "worked") {
        // Combina horas e pomodoros: ordena por tempo total trabalhado (em segundos)
        return (taskTimeMap.get(b.id) ?? 0) - (taskTimeMap.get(a.id) ?? 0);
      }
      return 0;
    });
  }, [sortKey, taskTimeMap]);

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

    // Exclude tasks from paused or completed projects
    filtered = filtered.filter((task) => {
      if (!task.projectId) return true; // Keep tasks without project
      const project = projects.find((p) => p.id === task.projectId);
      if (!project) return true; // Project not found, keep task
      return project.status === "active"; // Only keep tasks from active projects
    });

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
  const filteredIncomplete = useMemo(
    () => applySort(filterTasks(allIncompleteTasks)),
    [allIncompleteTasks, sortKey, filterProjectIds, filterNoProject, filterPriorities, filterDate, customDateRange, projects]
  );
  const incompleteTasks = useMemo(() => applyLimit(filteredIncomplete, limit), [filteredIncomplete, limit]);
  const completedTasks = applyLimit(filterTasks(allCompletedTasks), limit);

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

  const handleToggleCompleted = useCallback(
    (id: string) => {
      toggleCompleted(id);
    },
    [toggleCompleted]
  );

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

  const currentTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null;

  const estimatedEndTime = calculateEstimatedEndTime();

  if (isLoading) return <TaskListSkeleton />;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto overflow-hidden">
      <div className="flex gap-2 w-full items-center">
        <TaskInput onAddTask={handleAddTask} />
      </div>

      {/* Filtros — compacto no modo floating, padrão na tela cheia */}
      <div className={`flex w-full gap-1.5 items-center ${compact ? "flex-nowrap overflow-x-auto scrollbar-none" : "flex-wrap gap-2 mt-1"}`}>
        <ProjectFilter
          selectedProjectIds={filterProjectIds}
          includeNoProject={filterNoProject}
          onSelectionChange={setProjectFilter}
          className={compact ? "shrink-0" : "flex-1 min-w-[120px]"}
          compact={compact}
        />
        <PriorityFilter
          selectedPriorities={filterPriorities}
          onSelectionChange={setFilterPriorities}
          compact={compact}
        />
        <DateFilter
          selectedFilter={filterDate}
          onFilterChange={setFilterDate}
          customRange={customDateRange}
          onCustomRangeChange={setCustomDateRange}
          compact={compact}
        />
      </div>

      {/* Sort chips + limit — compact usa ícones com title tooltip */}
      <div className="flex items-center gap-1.5 w-full">
        <ArrowUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
        {(Object.keys(TASK_SORT_LABELS) as TaskSortKey[]).map((key) => {
          const Icon = TASK_SORT_ICONS[key];
          const isActive = sortKey === key;
          return (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              title={TASK_SORT_LABELS[key]}
              className={`rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 border
                ${compact ? "p-1.5" : "px-2.5 py-1"}
                ${isActive
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-white/5 text-white/40 border-white/10 hover:text-white/60 hover:bg-white/10"
                }`}
            >
              {compact
                ? <Icon className="w-3.5 h-3.5" />
                : TASK_SORT_LABELS[key]
              }
            </button>
          );
        })}
        <div className="ml-auto">
          <LimitChip value={limit} onChange={setLimit} totalCount={filteredIncomplete.length} />
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
        onToggleCompleted={handleToggleCompleted}
        onToggleFavorite={toggleFavorite}
        onSetDueDate={setDueDate}
        onRemoveTask={removeTask}
        onTaskClick={handleTaskClick}
        onTaskDoubleClick={handleTaskDoubleClick}
        onReorderTasks={reorderTasks}
        onDuplicateTask={duplicateTask}
        onSetRepeat={setRepeat}
        formatEndTime={formatEndTime}
      />

      <TaskDetails
        task={currentTask}
        open={detailsOpen}
        sessions={sessions}
        onOpenChange={setDetailsOpen}
        onToggleCompleted={handleToggleCompleted}
        onToggleFavorite={toggleFavorite}
        onUpdateTask={updateTask}
        onAddStep={addStep}
        onToggleStep={toggleStep}
        onRemoveStep={removeStep}
        onUpdateStep={updateStep}
        onReorderSteps={reorderSteps}
        onSetRepeatDays={setRepeatDays}
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

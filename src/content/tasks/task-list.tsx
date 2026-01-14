import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useActiveTask } from "@/hooks/use-active-task";
import { useConfig } from "@/hooks/use-config";
import { TaskInput } from "./task-input";
import { TaskListContent } from "./task-list-content";
import { TaskDetails } from "./task-details";
import { ProjectFilter } from "./project-filter";
import { Task, TaskReminder } from "@/types/task.types";

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
    setSkills
  } = useTasks();
  const { sessions } = usePomodoroSessions();
  const { activeTask, setActiveTask, clearActiveTask } = useActiveTask();
  const { settings: timerSettings } = useConfig();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const [filterProjectIds, setFilterProjectIds] = useState<string[]>([]);
  const [filterNoProject, setFilterNoProject] = useState(false);

  useEffect(() => {
    if (initialFilterProjectId) {
      setFilterProjectIds([initialFilterProjectId]);
      setFilterNoProject(false);
    }
  }, [initialFilterProjectId]);

  const hasActiveFilter = filterProjectIds.length > 0 || filterNoProject;

  const filterTasks = (taskList: Task[]): Task[] => {
    if (!hasActiveFilter) return taskList;
    return taskList.filter((task) => {
      if (filterNoProject && !task.projectId) return true;
      if (filterProjectIds.includes(task.projectId || "")) return true;
      return false;
    });
  };

  const allIncompleteTasks = tasks.filter((t) => !t.completed);
  const allCompletedTasks = tasks.filter((t) => t.completed);
  const incompleteTasks = filterTasks(allIncompleteTasks);
  const completedTasks = filterTasks(allCompletedTasks);

  const handleAddTask = (
    title: string,
    options: {
      dueDate: number | null;
      reminder: TaskReminder | null;
      estimatedPomodoros: number | null;
    }
  ) => {
    addTask(title, "Tasks", options);
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
    <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto">
      <TaskInput onAddTask={handleAddTask} />

      <ProjectFilter
        selectedProjectIds={filterProjectIds}
        includeNoProject={filterNoProject}
        onSelectionChange={(projectIds, includeNoProject) => {
          setFilterProjectIds(projectIds);
          setFilterNoProject(includeNoProject);
        }}
        className="mt-2"
      />

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
        onStartPomodoro={handleStartPomodoro}
      />
    </div>
  );
}

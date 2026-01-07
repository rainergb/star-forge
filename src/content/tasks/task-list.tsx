import { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  Bell,
  Repeat,
  ChevronDown,
  ChevronRight,
  Timer,
  Plus,
  Minus,
  Clock
} from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useActiveTask } from "@/hooks/use-active-task";
import { useConfig } from "@/hooks/use-config";
import { TaskItem } from "./task-item";
import { TaskDetails } from "./task-details";
import { Task, TaskReminder } from "@/types/task.types";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { cn } from "@/lib/utils";

interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetDueDate: (id: string, date: number | null) => void;
  onRemoveTask: (id: string) => void;
  onClick: () => void;
  onFocus: () => void;
  expectedEndTime?: string;
}

function SortableTaskItem({
  task,
  isActive,
  onToggleCompleted,
  onToggleFavorite,
  onSetDueDate,
  onRemoveTask,
  onClick,
  onFocus,
  expectedEndTime
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group"
    >
      <div
        className={cn(
          "absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full transition-all",
          isActive ? "bg-primary opacity-100" : "bg-transparent opacity-0"
        )}
      />
      <TaskItem
        task={task}
        isActive={isActive}
        onToggleCompleted={onToggleCompleted}
        onToggleFavorite={onToggleFavorite}
        onSetDueDate={onSetDueDate}
        onRemoveTask={onRemoveTask}
        onClick={onClick}
        onFocus={onFocus}
        expectedEndTime={expectedEndTime}
      />
    </div>
  );
}

interface TaskListProps {
  onNavigateToPomodoro?: () => void;
  compact?: boolean;
  onSelectTask?: (task: Task) => void;
  onClearTask?: () => void;
}

export function TaskList({
  onNavigateToPomodoro,
  onSelectTask,
  onClearTask
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
    reorderTasks
  } = useTasks();
  const { sessions } = usePomodoroSessions();
  const { activeTask, setActiveTask, clearActiveTask } = useActiveTask();
  const { settings: timerSettings } = useConfig();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState<number | null>(null);
  const [newTaskReminder, setNewTaskReminder] = useState<TaskReminder | null>(
    null
  );
  const [newTaskRepeat, setNewTaskRepeat] = useState<string | null>(null);
  const [newTaskPomodoros, setNewTaskPomodoros] = useState<number | null>(null);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showRepeatMenu, setShowRepeatMenu] = useState(false);
  const [showPomodoroInput, setShowPomodoroInput] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(false);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const sortedTasks = [...incompleteTasks, ...completedTasks];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
      reorderTasks(oldIndex, newIndex);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), "Tarefas", {
        dueDate: newTaskDueDate,
        reminder: newTaskReminder,
        estimatedPomodoros: newTaskPomodoros
      });
      setNewTaskTitle("");
      setNewTaskDueDate(null);
      setNewTaskReminder(null);
      setNewTaskRepeat(null);
      setNewTaskPomodoros(null);
    }
  };

  const handleDueDateSave = (date: Date) => {
    setNewTaskDueDate(date.getTime());
    setShowDueDatePicker(false);
  };

  const handleReminderSave = (date: Date) => {
    setNewTaskReminder({ date: date.getTime(), label: "Lembrete" });
    setShowReminderPicker(false);
  };

  const repeatOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" }
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const handleFocusTask = (task: Task) => {
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
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="w-full relative" ref={inputContainerRef}>
        <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
          />
          {newTaskTitle.trim() && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowDueDatePicker(!showDueDatePicker)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  newTaskDueDate
                    ? "text-primary bg-primary/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
                title="Data de conclusão"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowReminderPicker(!showReminderPicker)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  newTaskReminder
                    ? "text-primary bg-primary/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
                title="Lembrete"
              >
                <Bell className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRepeatMenu(!showRepeatMenu)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  newTaskRepeat
                    ? "text-primary bg-primary/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
                title="Repetir"
              >
                <Repeat className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setShowPomodoroInput(!showPomodoroInput)}
                className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                  newTaskPomodoros
                    ? "text-primary bg-primary/20"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
                title="Pomodoros estimados"
              >
                <Timer className="w-4 h-4" />
                {newTaskPomodoros && (
                  <span className="text-xs">{newTaskPomodoros}</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Due Date Picker */}
        {showDueDatePicker && (
          <DateTimePickerPopover
            title="Data de conclusão"
            initialDate={newTaskDueDate ? new Date(newTaskDueDate) : undefined}
            onSave={handleDueDateSave}
            onClose={() => setShowDueDatePicker(false)}
          />
        )}

        {/* Reminder Picker */}
        {showReminderPicker && (
          <DateTimePickerPopover
            title="Lembrete"
            initialDate={
              newTaskReminder ? new Date(newTaskReminder.date) : undefined
            }
            onSave={handleReminderSave}
            onClose={() => setShowReminderPicker(false)}
          />
        )}

        {/* Repeat Menu */}
        {showRepeatMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowRepeatMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-40">
              <div className="py-1">
                {repeatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setNewTaskRepeat(option.value);
                      setShowRepeatMenu(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      newTaskRepeat === option.value
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                {newTaskRepeat && (
                  <button
                    onClick={() => {
                      setNewTaskRepeat(null);
                      setShowRepeatMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5 cursor-pointer border-t border-white/10"
                  >
                    Remove repeat
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Pomodoro Input */}
        {showPomodoroInput && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPomodoroInput(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">Pomodoros:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const current = newTaskPomodoros ?? 0;
                      if (current > 1) {
                        setNewTaskPomodoros(current - 1);
                      } else {
                        setNewTaskPomodoros(null);
                      }
                    }}
                    disabled={!newTaskPomodoros}
                    className="h-7 w-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm text-white/90 font-medium">
                    {newTaskPomodoros ?? "-"}
                  </span>
                  <button
                    onClick={() => {
                      const current = newTaskPomodoros ?? 0;
                      if (current < 99) {
                        setNewTaskPomodoros(current + 1);
                      }
                    }}
                    className="h-7 w-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              {newTaskPomodoros && (
                <button
                  onClick={() => {
                    setNewTaskPomodoros(null);
                    setShowPomodoroInput(false);
                  }}
                  className="w-full mt-2 px-2 py-1 text-xs text-red-400 hover:bg-white/5 rounded cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto scrollbar-none">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            No tasks yet. Add one above!
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={incompleteTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {incompleteTasks.map((task, index) => {
                  const taskEndTime = task.estimatedPomodoros
                    ? calculateTaskEndTime(index)
                    : null;
                  return (
                    <div key={task.id} className="relative">
                      <SortableTaskItem
                        task={task}
                        isActive={activeTask?.id === task.id}
                        onToggleCompleted={toggleCompleted}
                        onToggleFavorite={toggleFavorite}
                        onSetDueDate={setDueDate}
                        onRemoveTask={removeTask}
                        onClick={() => handleFocusTask(task)}
                        onFocus={() => handleTaskClick(task)}
                        expectedEndTime={
                          taskEndTime ? formatEndTime(taskEndTime) : undefined
                        }
                      />
                    </div>
                  );
                })}
              </SortableContext>
            </DndContext>

            {completedTasks.length > 0 && (
              <>
                <button
                  onClick={() => setCompletedCollapsed(!completedCollapsed)}
                  className="flex items-center gap-2 w-full py-2 text-white/60 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {completedCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Concluída</span>
                  <span className="text-sm text-white/40">
                    {completedTasks.length}
                  </span>
                </button>

                {!completedCollapsed && (
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggleCompleted={toggleCompleted}
                        onToggleFavorite={toggleFavorite}
                        onSetDueDate={setDueDate}
                        onRemoveTask={removeTask}
                        onClick={() => handleTaskClick(task)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm text-white/40">
            {tasks.filter((t) => t.completed).length} of {tasks.length}{" "}
            completed
          </div>
          {estimatedEndTime && (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              <span>Expected end: {formatEndTime(estimatedEndTime)}</span>
            </div>
          )}
        </div>
      )}

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
        onStartPomodoro={handleStartPomodoro}
      />
    </div>
  );
}

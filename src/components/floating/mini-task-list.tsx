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
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { FloatingContainer } from "./floating-container";
import { MiniTaskItem } from "./mini-task-item";
import { TaskList } from "@/content/tasks/task-list";
import { useTasks } from "@/hooks/use-tasks";
import { useActiveTask } from "@/hooks/use-active-task";
import { useTaskFilters } from "@/hooks/use-task-filters";
import { Task } from "@/types/task.types";
import { WidgetPosition } from "@/types/widget.types";
import { ListTodo, Focus } from "lucide-react";
import {
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
  isWithinInterval
} from "date-fns";

interface MiniTaskListProps {
  isVisible: boolean;
  isPinned: boolean;
  isExpanded?: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleExpand?: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onSelectTask: (task: Task) => void;
  onClearTask: () => void;
  stackIndex?: number;
}

export function MiniTaskList({
  isVisible,
  isPinned,
  isExpanded = false,
  position,
  onClose,
  onTogglePin,
  onToggleExpand,
  onPositionChange,
  onSelectTask,
  onClearTask,
  stackIndex
}: MiniTaskListProps) {
  const { tasks, toggleComplete, reorderTasks } = useTasks();
  const { activeTask } = useActiveTask();
  const {
    projectIds: filterProjectIds,
    noProject: filterNoProject,
    priorities: filterPriorities,
    dateFilter: filterDate,
    customDateRange,
    hasActiveFilter
  } = useTaskFilters();

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

    if (filterProjectIds.length > 0 || filterNoProject) {
      filtered = filtered.filter((task) => {
        if (filterNoProject && !task.projectId) return true;
        if (filterProjectIds.includes(task.projectId || "")) return true;
        return false;
      });
    }

    if (filterPriorities.length > 0) {
      filtered = filtered.filter((task) =>
        filterPriorities.includes(task.priority)
      );
    }

    if (filterDate !== "all") {
      filtered = filtered.filter(matchesDateFilter);
    }

    return filtered;
  };

  const allTasks = tasks;
  const incompleteTasks = filterTasks(allTasks.filter((t) => !t.completed));
  const completedTasks = filterTasks(allTasks.filter((t) => t.completed));
  const sortedTasks = [...incompleteTasks, ...completedTasks];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
      reorderTasks(oldIndex, newIndex);
    }
  };

  const handleSelectTask = (task: Task) => {
    if (task.completed) return;
    if (activeTask?.id === task.id) {
      onClearTask();
    } else {
      onSelectTask(task);
    }
  };

  if (!isVisible) return null;

  const title = hasActiveFilter ? "Tasks (filtered)" : "Tasks";

  // Render full TaskList when expanded
  if (isExpanded) {
    return (
      <FloatingContainer
        title={title}
        isVisible={isVisible}
        isPinned={isPinned}
        isExpanded={isExpanded}
        position={position}
        onClose={onClose}
        onTogglePin={onTogglePin}
        onToggleExpand={onToggleExpand}
        onPositionChange={onPositionChange}
        expandedClassName="w-[420px] max-h-[calc(100vh-120px)]"
        stackIndex={stackIndex}
      >
        <div className="flex-1 overflow-y-auto scrollbar-none">
          <TaskList
            compact
            onSelectTask={onSelectTask}
            onClearTask={onClearTask}
          />
        </div>
      </FloatingContainer>
    );
  }

  // Mini version when not expanded
  return (
    <FloatingContainer
      title={title}
      isVisible={isVisible}
      isPinned={isPinned}
      isExpanded={isExpanded}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onToggleExpand={onToggleExpand}
      onPositionChange={onPositionChange}
      stackIndex={stackIndex}
    >
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/40">
          <ListTodo className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">No tasks</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[340px] scrollbar-none p-2 space-y-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTasks.map((task) => (
                <MiniTaskItem
                  key={task.id}
                  task={task}
                  isActive={activeTask?.id === task.id}
                  onSelect={handleSelectTask}
                  onToggleComplete={toggleComplete}
                />
              ))}
            </SortableContext>
          </DndContext>

          {activeTask && (
            <button
              onClick={onClearTask}
              className="w-full flex items-center gap-2 px-2 py-1.5 mt-2 rounded-lg text-xs text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors border-t border-white/10 pt-2"
            >
              <Focus className="h-3.5 w-3.5" />
              <span>Free focus</span>
            </button>
          )}
        </div>
      )}
    </FloatingContainer>
  );
}

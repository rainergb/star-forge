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
import { Clock, ListTodo } from "lucide-react";
import { Task } from "@/types/task.types";
import { TaskItem } from "./task-item";
import { cn } from "@/lib/utils";
import {
  ListContainer,
  CollapsibleSection,
  EmptyState,
  ListSummary
} from "@/components/shared/list-container";

interface SortableTaskItemProps {
  task: Task;
  isActive: boolean;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetDueDate: (id: string, date: number | null) => void;
  onRemoveTask: (id: string) => void;
  onClick: () => void;
  onDoubleClick: () => void;
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
  onDoubleClick,
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
        onDoubleClick={onDoubleClick}
        expectedEndTime={expectedEndTime}
      />
    </div>
  );
}

interface TaskListContentProps {
  tasks: Task[];
  incompleteTasks: Task[];
  completedTasks: Task[];
  activeTaskId?: string;
  hasActiveFilter: boolean;
  estimatedEndTime: Date | null;
  completedCollapsed: boolean;
  onToggleCompletedCollapsed: () => void;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetDueDate: (id: string, date: number | null) => void;
  onRemoveTask: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDoubleClick: (task: Task) => void;
  onReorderTasks: (oldIndex: number, newIndex: number) => void;
  calculateTaskEndTime: (index: number) => Date | null;
  formatEndTime: (date: Date) => string;
}

export function TaskListContent({
  tasks,
  incompleteTasks,
  completedTasks,
  activeTaskId,
  hasActiveFilter,
  estimatedEndTime,
  completedCollapsed,
  onToggleCompletedCollapsed,
  onToggleCompleted,
  onToggleFavorite,
  onSetDueDate,
  onRemoveTask,
  onTaskClick,
  onTaskDoubleClick,
  onReorderTasks,
  calculateTaskEndTime,
  formatEndTime
}: TaskListContentProps) {
  const sortedTasks = [...incompleteTasks, ...completedTasks];

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
      onReorderTasks(oldIndex, newIndex);
    }
  };

  if (sortedTasks.length === 0) {
    return (
      <EmptyState
        icon={ListTodo}
        message="No tasks yet"
        hint="Add one above to get started!"
        hasFilter={hasActiveFilter}
        filterMessage="No tasks found with the applied filters."
      />
    );
  }

  return (
    <>
      <ListContainer>
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
                    isActive={activeTaskId === task.id}
                    onToggleCompleted={onToggleCompleted}
                    onToggleFavorite={onToggleFavorite}
                    onSetDueDate={onSetDueDate}
                    onRemoveTask={onRemoveTask}
                    onClick={() => onTaskClick(task)}
                    onDoubleClick={() => onTaskDoubleClick(task)}
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
          <CollapsibleSection
            label="Completed"
            count={completedTasks.length}
            collapsed={completedCollapsed}
            onToggle={onToggleCompletedCollapsed}
          >
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleCompleted={onToggleCompleted}
                  onToggleFavorite={onToggleFavorite}
                  onSetDueDate={onSetDueDate}
                  onRemoveTask={onRemoveTask}
                  onClick={() => onTaskClick(task)}
                  onDoubleClick={() => onTaskDoubleClick(task)}
                />
              ))}
            </div>
          </CollapsibleSection>
        )}
      </ListContainer>

      {tasks.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <ListSummary
            completed={tasks.filter((t) => t.completed).length}
            total={tasks.length}
          />
          {estimatedEndTime && (
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3 h-3" />
              <span>Estimated finish: {formatEndTime(estimatedEndTime)}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

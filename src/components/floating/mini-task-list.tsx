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
import { Task } from "@/types/task.types";
import { WidgetPosition } from "@/types/widget.types";
import { ListTodo, Focus } from "lucide-react";

interface MiniTaskListProps {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onSelectTask: (task: Task) => void;
  onClearTask: () => void;
  stackIndex?: number;
}

export function MiniTaskList({
  isVisible,
  isPinned,
  position,
  onClose,
  onTogglePin,
  onPositionChange,
  onSelectTask,
  onClearTask,
  stackIndex
}: MiniTaskListProps) {
  const { tasks, toggleComplete, reorderTasks } = useTasks();
  const { activeTask } = useActiveTask();

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

  const handleSelectTask = (task: Task) => {
    if (task.completed) return;
    if (activeTask?.id === task.id) {
      onClearTask();
    } else {
      onSelectTask(task);
    }
  };

  if (!isVisible) return null;

  // Renderiza TaskList completo quando fixado
  if (isPinned) {
    return (
      <FloatingContainer
        title="Tarefas"
        isVisible={isVisible}
        isPinned={isPinned}
        position={position}
        onClose={onClose}
        onTogglePin={onTogglePin}
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

  // Versão mini quando não fixado
  return (
    <FloatingContainer
      title="Tarefas"
      isVisible={isVisible}
      isPinned={isPinned}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onPositionChange={onPositionChange}
      stackIndex={stackIndex}
    >
      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/40">
          <ListTodo className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">Sem tarefas</p>
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

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
import { FloatingContainer } from "./floating-container";
import { ProjectList } from "@/content/projects/project-list";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { WidgetPosition } from "@/types/widget.types";
import { FolderKanban, Folder, ListTodo, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniProjectListProps {
  isVisible: boolean;
  isPinned: boolean;
  isExpanded?: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleExpand?: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onSelectProject?: (project: Project) => void;
  stackIndex?: number;
}

interface MiniProjectItemProps {
  project: Project;
  tasksCount: { total: number; completed: number };
  onSelect: (project: Project) => void;
}

function MiniProjectItem({
  project,
  tasksCount,
  onSelect
}: MiniProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const colors = PROJECT_COLORS[project.color];
  const progress =
    tasksCount.total > 0 ? (tasksCount.completed / tasksCount.total) * 100 : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg",
        "transition-colors duration-150",
        "group cursor-pointer",
        isDragging && "opacity-50 bg-white/10",
        "hover:bg-white/5"
      )}
      onClick={() => onSelect(project)}
    >
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none cursor-grab active:cursor-grabbing",
          "text-white/30 hover:text-white/70",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <div className={cn("p-1.5 rounded", colors.bg)}>
        <Folder className={cn("w-3.5 h-3.5", colors.text)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/90 truncate">{project.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-white/40 flex items-center gap-1">
            <ListTodo className="w-3 h-3" />
            {tasksCount.completed}/{tasksCount.total}
          </span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[60px]">
            <div
              className={cn("h-full rounded-full", colors.bg)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniProjectList({
  isVisible,
  isPinned,
  isExpanded = false,
  position,
  onClose,
  onTogglePin,
  onToggleExpand,
  onPositionChange,
  onSelectProject,
  stackIndex
}: MiniProjectListProps) {
  const { projects, reorderProjects } = useProjects();
  const { tasks } = useTasks();

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

  const activeProjects = projects.filter((p) => p.status === "active");

  const getTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.completed).length
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeProjects.findIndex((p) => p.id === active.id);
      const newIndex = activeProjects.findIndex((p) => p.id === over.id);
      
      const newOrder = [...activeProjects];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);

      reorderProjects(newOrder.map((p) => p.id));
    }
  };

  if (!isVisible) return null;

  // Render full ProjectList when expanded
  if (isExpanded) {
    return (
      <FloatingContainer
        title="Projects"
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
          <ProjectList />
        </div>
      </FloatingContainer>
    );
  }

  // Mini version when not expanded
  return (
    <FloatingContainer
      title="Projects"
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
      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/40">
          <FolderKanban className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">No active projects</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[340px] scrollbar-none p-2 space-y-0.5">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeProjects.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {activeProjects.map((project) => (
                <MiniProjectItem
                  key={project.id}
                  project={project}
                  tasksCount={getTaskCounts(project.id)}
                  onSelect={(p) => onSelectProject?.(p)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </FloatingContainer>
  );
}

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
import { FolderOpen } from "lucide-react";
import { Project } from "@/types/project.types";
import { ProjectItem } from "./project-item";
import {
  ListContainer,
  CollapsibleSection,
  EmptyState
} from "@/components/shared/list-container";

interface SortableProjectItemProps {
  project: Project;
  tasksCount: number;
  completedTasksCount: number;
  onClick: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}

function SortableProjectItem({
  project,
  tasksCount,
  completedTasksCount,
  onClick,
  onToggleFavorite,
  onRemove
}: SortableProjectItemProps) {
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
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectItem
        project={project}
        tasksCount={tasksCount}
        completedTasksCount={completedTasksCount}
        onClick={onClick}
        onToggleFavorite={onToggleFavorite}
        onRemove={onRemove}
      />
    </div>
  );
}

interface ProjectListContentProps {
  projects: Project[];
  activeProjects: Project[];
  archivedProjects: Project[];
  archivedCollapsed: boolean;
  onToggleArchivedCollapsed: () => void;
  onProjectClick: (project: Project) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveProject: (id: string) => void;
  onReorderProjects: (ids: string[]) => void;
  getTaskCounts: (projectId: string) => { total: number; completed: number };
}

export function ProjectListContent({
  projects,
  activeProjects,
  archivedProjects,
  archivedCollapsed,
  onToggleArchivedCollapsed,
  onProjectClick,
  onToggleFavorite,
  onRemoveProject,
  onReorderProjects,
  getTaskCounts
}: ProjectListContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeProjects.findIndex((p) => p.id === active.id);
      const newIndex = activeProjects.findIndex((p) => p.id === over.id);

      const newOrder = [...activeProjects];
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);

      onReorderProjects(newOrder.map((p) => p.id));
    }
  };

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        message="No projects yet"
        hint="Add one above to get started!"
      />
    );
  }

  return (
    <ListContainer>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeProjects.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {activeProjects.map((project) => {
            const counts = getTaskCounts(project.id);
            return (
              <SortableProjectItem
                key={project.id}
                project={project}
                tasksCount={counts.total}
                completedTasksCount={counts.completed}
                onClick={() => onProjectClick(project)}
                onToggleFavorite={() => onToggleFavorite(project.id)}
                onRemove={() => onRemoveProject(project.id)}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      {archivedProjects.length > 0 && (
        <CollapsibleSection
          label="Archived"
          count={archivedProjects.length}
          collapsed={archivedCollapsed}
          onToggle={onToggleArchivedCollapsed}
        >
          <div className="space-y-2">
            {archivedProjects.map((project) => {
              const counts = getTaskCounts(project.id);
              return (
                <ProjectItem
                  key={project.id}
                  project={project}
                  tasksCount={counts.total}
                  completedTasksCount={counts.completed}
                  onClick={() => onProjectClick(project)}
                  onToggleFavorite={() => onToggleFavorite(project.id)}
                  onRemove={() => onRemoveProject(project.id)}
                />
              );
            })}
          </div>
        </CollapsibleSection>
      )}
    </ListContainer>
  );
}

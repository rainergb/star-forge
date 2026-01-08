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
import { ChevronDown, ChevronRight, FolderPlus } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectItem } from "./project-item";
import { ProjectDetails } from "./project-details";
import { Project } from "@/types/project.types";

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

export function ProjectList() {
  const {
    projects,
    addProject,
    updateProject,
    removeProject,
    setStatus,
    toggleFavorite,
    reorderProjects
  } = useProjects();
  const { tasks, setProject } = useTasks();

  const [newProjectName, setNewProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);
  const inputRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const activeProjects = projects.filter((p) => p.status !== "archived");
  const archivedProjects = projects.filter((p) => p.status === "archived");

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

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddProject();
    }
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    projectTasks.forEach((task) => {
      setProject(task.id, null);
    });
    removeProject(projectId);

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setDetailsOpen(false);
    }
  };

  const getTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.completed).length
    };
  };

  const currentProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || null
    : null;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="w-full relative" ref={inputRef}>
        <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
          <FolderPlus className="w-5 h-5 text-white/30" />
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar novo projeto..."
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto scrollbar-none">
        {projects.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            Nenhum projeto ainda. Adicione um acima!
          </div>
        ) : (
          <>
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
                      onClick={() => handleProjectClick(project)}
                      onToggleFavorite={() => toggleFavorite(project.id)}
                      onRemove={() => handleDeleteProject(project.id)}
                    />
                  );
                })}
              </SortableContext>
            </DndContext>

            {archivedProjects.length > 0 && (
              <>
                <button
                  onClick={() => setArchivedCollapsed(!archivedCollapsed)}
                  className="flex items-center gap-2 w-full py-2 text-white/60 hover:text-white/80 transition-colors cursor-pointer"
                >
                  {archivedCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Arquivados</span>
                  <span className="text-sm text-white/40">
                    {archivedProjects.length}
                  </span>
                </button>

                {!archivedCollapsed && (
                  <div className="space-y-2">
                    {archivedProjects.map((project) => {
                      const counts = getTaskCounts(project.id);
                      return (
                        <ProjectItem
                          key={project.id}
                          project={project}
                          tasksCount={counts.total}
                          completedTasksCount={counts.completed}
                          onClick={() => handleProjectClick(project)}
                          onToggleFavorite={() => toggleFavorite(project.id)}
                          onRemove={() => handleDeleteProject(project.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {projects.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="text-sm text-white/40">
            {projects.filter((p) => p.status === "completed").length} de{" "}
            {projects.length} concluídos
          </div>
        </div>
      )}

      <ProjectDetails
        project={currentProject}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onToggleFavorite={toggleFavorite}
        onUpdateProject={updateProject}
        onSetStatus={setStatus}
        onRemoveProject={handleDeleteProject}
      />
    </div>
  );
}

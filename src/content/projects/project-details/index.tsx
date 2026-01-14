import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Project, ProjectStatus, ProjectColor } from "@/types/project.types";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectHeader } from "./project-header";
import { ProjectActionsSection } from "./project-actions-section";
import { ProjectStatsSection } from "./project-stats-section";
import { ProjectTasksSection } from "./project-tasks-section";
import { ProjectFooter } from "./project-footer";

interface ProjectDetailsProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onSetStatus: (id: string, status: ProjectStatus) => void;
  onRemoveProject: (id: string) => void;
  onNavigateToTasks?: (projectId: string) => void;
}

export function ProjectDetails({
  project,
  open,
  onOpenChange,
  onToggleFavorite,
  onUpdateProject,
  onSetStatus,
  onRemoveProject,
  onNavigateToTasks
}: ProjectDetailsProps) {
  const { tasks, setProject, addTask } = useTasks();

  const handleDelete = () => {
    if (!project) return;
    onRemoveProject(project.id);
    onOpenChange(false);
  };

  const projectTasks = project
    ? tasks.filter((t) => t.projectId === project.id)
    : [];

  const handleAddTask = (title: string) => {
    if (!project) return;
    addTask(title, "Tasks", { projectId: project.id });
  };

  const handleRemoveTaskFromProject = (taskId: string) => {
    setProject(taskId, null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 text-white flex flex-col">
        {project && (
          <>
            <div className="flex-1 overflow-y-auto">
              <ProjectHeader
                project={project}
                onToggleFavorite={() => onToggleFavorite(project.id)}
                onUpdateName={(name) => onUpdateProject(project.id, { name })}
                onUpdateDescription={(description) =>
                  onUpdateProject(project.id, { description })
                }
                onUpdateImage={(image) =>
                  onUpdateProject(project.id, { image })
                }
              />

              <ProjectActionsSection
                status={project.status}
                color={project.color}
                onSetStatus={(status: ProjectStatus) =>
                  onSetStatus(project.id, status)
                }
                onSetColor={(color: ProjectColor) =>
                  onUpdateProject(project.id, { color })
                }
              />

              <ProjectStatsSection project={project} tasks={projectTasks} />

              <ProjectTasksSection
                tasks={projectTasks}
                onAddTask={handleAddTask}
                onRemoveFromProject={handleRemoveTaskFromProject}
                onNavigateToTasks={
                  onNavigateToTasks
                    ? () => {
                        onNavigateToTasks(project.id);
                        onOpenChange(false);
                      }
                    : undefined
                }
              />
            </div>

            <ProjectFooter
              createdAt={project.createdAt}
              onDelete={handleDelete}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

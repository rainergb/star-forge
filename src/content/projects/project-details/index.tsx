import {
  Project,
  ProjectStatus,
  ProjectIcon,
  ProjectColor
} from "@/types/project.types";
import { useTasks } from "@/hooks/use-tasks";
import {
  DetailContainer,
  DetailContent
} from "@/components/shared/detail-item";
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
  onUpdateIcon?: (id: string, icon: ProjectIcon) => void;
  onUpdateColor?: (id: string, color: ProjectColor) => void;
}

export function ProjectDetails({
  project,
  open,
  onOpenChange,
  onToggleFavorite,
  onUpdateProject,
  onSetStatus,
  onRemoveProject,
  onNavigateToTasks,
  onUpdateIcon,
  onUpdateColor
}: ProjectDetailsProps) {
  const { tasks, setProject, addTask, updateTask, toggleCompleted } =
    useTasks();

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

  const handleUpdateTaskTitle = (taskId: string, title: string) => {
    updateTask(taskId, { title });
  };

  return (
    <DetailContainer open={open} onOpenChange={onOpenChange}>
      {project && (
        <>
          <DetailContent className="flex flex-col">
            <ProjectHeader
              project={project}
              onToggleFavorite={() => onToggleFavorite(project.id)}
              onUpdateName={(name) => onUpdateProject(project.id, { name })}
              onUpdateDescription={(description) =>
                onUpdateProject(project.id, { description })
              }
              onUpdateImage={(image) => onUpdateProject(project.id, { image })}
              onUpdateIcon={(icon) =>
                onUpdateIcon
                  ? onUpdateIcon(project.id, icon)
                  : onUpdateProject(project.id, { icon })
              }
              onUpdateColor={(color) =>
                onUpdateColor
                  ? onUpdateColor(project.id, color)
                  : onUpdateProject(project.id, { color })
              }
            />

            <ProjectActionsSection
              status={project.status}
              onSetStatus={(status: ProjectStatus) =>
                onSetStatus(project.id, status)
              }
            />

            <ProjectStatsSection project={project} tasks={projectTasks} />

            <ProjectTasksSection
              tasks={projectTasks}
              onAddTask={handleAddTask}
              onRemoveFromProject={handleRemoveTaskFromProject}
              onUpdateTaskTitle={handleUpdateTaskTitle}
              onToggleComplete={toggleCompleted}
              onNavigateToTasks={
                onNavigateToTasks
                  ? () => {
                      onNavigateToTasks(project.id);
                      onOpenChange(false);
                    }
                  : undefined
              }
            />
          </DetailContent>

          <ProjectFooter
            createdAt={project.createdAt}
            onDelete={handleDelete}
          />
        </>
      )}
    </DetailContainer>
  );
}

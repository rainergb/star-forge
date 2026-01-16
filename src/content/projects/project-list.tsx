import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectInput } from "./project-input";
import { ProjectListContent } from "./project-list-content";
import { ProjectDetails } from "./project-details";
import { Project, ProjectColor } from "@/types/project.types";
import { ListSummary } from "@/components/shared/list-container";

interface ProjectListProps {
  onNavigateToTasks?: (projectId: string) => void;
}

export function ProjectList({ onNavigateToTasks }: ProjectListProps) {
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

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

  const activeProjects = projects.filter((p) => p.status !== "archived");
  const archivedProjects = projects.filter((p) => p.status === "archived");

  const handleAddProject = (
    name: string,
    options?: { color?: ProjectColor }
  ) => {
    addProject(name, options);
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
      <ProjectInput onAddProject={handleAddProject} />

      <ProjectListContent
        projects={projects}
        activeProjects={activeProjects}
        archivedProjects={archivedProjects}
        archivedCollapsed={archivedCollapsed}
        onToggleArchivedCollapsed={() => setArchivedCollapsed(!archivedCollapsed)}
        onProjectClick={handleProjectClick}
        onToggleFavorite={toggleFavorite}
        onRemoveProject={handleDeleteProject}
        onReorderProjects={reorderProjects}
        getTaskCounts={getTaskCounts}
      />

      {projects.length > 0 && (
        <ListSummary
          completed={projects.filter((p) => p.status === "completed").length}
          total={projects.length}
        />
      )}

      <ProjectDetails
        project={currentProject}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onToggleFavorite={toggleFavorite}
        onUpdateProject={updateProject}
        onSetStatus={setStatus}
        onRemoveProject={handleDeleteProject}
        onNavigateToTasks={onNavigateToTasks}
      />
    </div>
  );
}

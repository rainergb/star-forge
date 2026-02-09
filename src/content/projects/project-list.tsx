import { useState } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useToast } from "@/hooks/use-toast";
import { ProjectInput } from "./project-input";
import { ProjectListContent } from "./project-list-content";
import { ProjectDetails } from "./project-details";
import { ExportButton } from "@/components/shared/export-button";
import { ImportButton } from "@/components/shared/import-button";
import {
  exportProjects,
  importFromFile,
  validateProjectsImport,
  validateTasksImport
} from "@/services/export-service";
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
    reorderProjects,
    importProjects
  } = useProjects();
  const { tasks, setProject, importTasks } = useTasks();
  const { toast } = useToast();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      <div className="flex gap-2 w-full items-center">
        <ProjectInput onAddProject={handleAddProject} />
        <ExportButton
          onExport={() => exportProjects(projects, tasks)}
          tooltip="Export projects"
        />
        <ImportButton
          onImport={async (file) => {
            const result = await importFromFile(file);
            if (result.success && result.data?.projects) {
              if (validateProjectsImport(result.data.projects)) {
                importProjects(result.data.projects);
                // Also import related tasks if present
                if (
                  result.data.tasks &&
                  validateTasksImport(result.data.tasks)
                ) {
                  importTasks(result.data.tasks);
                }
                toast({
                  title: "Import successful",
                  description: `${result.data.projects.length} projects imported`
                });
              } else {
                toast({
                  title: "Import failed",
                  description: "Invalid projects format",
                  variant: "destructive"
                });
              }
            } else {
              toast({
                title: "Import failed",
                description: result.message,
                variant: "destructive"
              });
            }
          }}
          tooltip="Import projects"
        />
      </div>

      <ProjectListContent
        projects={projects}
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

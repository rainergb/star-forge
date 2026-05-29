import { useState, useMemo } from "react";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useProjectSort, PROJECT_SORT_LABELS, PROJECT_SORT_ICONS } from "@/hooks/use-project-sort";
import type { ProjectSortKey } from "@/hooks/use-project-sort";
import { ProjectInput } from "./project-input";
import { ProjectListSkeleton } from "./project-list-skeleton";
import { ProjectListContent } from "./project-list-content";
import { ProjectDetails } from "./project-details";
import { Project, ProjectColor } from "@/types/project.types";
import { ListSummary } from "@/components/shared/list-container";
import { ArrowUpDown } from "lucide-react";
import { useListLimit } from "@/hooks/use-list-limit";
import { LimitChip, applyLimit } from "@/components/shared/limit-chip";

interface ProjectListProps {
  onNavigateToTasks?: (projectId: string) => void;
  compact?: boolean;
}

export function ProjectList({ onNavigateToTasks, compact = false }: ProjectListProps) {
  const {
    projects,
    isLoading,
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
  const { sortKey, setSortKey } = useProjectSort();
  const { limit, setLimit } = useListLimit("projects");

  // Deve ficar ANTES do useMemo que a utiliza
  const getTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.completed).length
    };
  };

  const sortedProjects = useMemo(() => {
    if (sortKey === "default") return projects;
    return [...projects].sort((a, b) => {
      if (sortKey === "hours") return b.totalTimeSpent - a.totalTimeSpent;
      if (sortKey === "open-tasks") {
        const aC = getTaskCounts(a.id);
        const bC = getTaskCounts(b.id);
        return (bC.total - bC.completed) - (aC.total - aC.completed);
      }
      return 0;
    });
  }, [projects, sortKey, tasks]);

  const limitedProjects = useMemo(
    () => applyLimit(sortedProjects, limit),
    [sortedProjects, limit]
  );

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

  const currentProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || null
    : null;

  if (isLoading) return <ProjectListSkeleton />;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex gap-2 w-full items-center">
        <ProjectInput onAddProject={handleAddProject} />
      </div>

      {/* Sort chips + limit — compact usa ícones com title tooltip */}
      <div className="flex items-center gap-1.5 w-full">
        <ArrowUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
        {(Object.keys(PROJECT_SORT_LABELS) as ProjectSortKey[]).map((key) => {
          const Icon = PROJECT_SORT_ICONS[key];
          const isActive = sortKey === key;
          return (
            <button
              key={key}
              onClick={() => setSortKey(key)}
              title={PROJECT_SORT_LABELS[key]}
              className={`rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 border
                ${compact ? "p-1.5" : "px-2.5 py-1"}
                ${isActive
                  ? "bg-primary/20 text-primary border-primary/30"
                  : "bg-white/5 text-white/40 border-white/10 hover:text-white/60 hover:bg-white/10"
                }`}
            >
              {compact
                ? <Icon className="w-3.5 h-3.5" />
                : PROJECT_SORT_LABELS[key]
              }
            </button>
          );
        })}
        <div className="ml-auto">
          <LimitChip value={limit} onChange={setLimit} totalCount={sortedProjects.length} />
        </div>
      </div>

      <ProjectListContent
        projects={limitedProjects}
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

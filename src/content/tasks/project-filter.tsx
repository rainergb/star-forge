import { useState } from "react";
import { Check, ChevronDown, Filter, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { PROJECT_COLORS } from "@/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectFilterProps {
  selectedProjectIds: string[];
  includeNoProject: boolean;
  onSelectionChange: (projectIds: string[], includeNoProject: boolean) => void;
  className?: string;
}

export function ProjectFilter({
  selectedProjectIds,
  includeNoProject,
  onSelectionChange,
  className
}: ProjectFilterProps) {
  const [open, setOpen] = useState(false);
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const activeProjects = projects.filter((p) => p.status === "active");

  const getTaskCountForProject = (projectId: string): number => {
    return tasks.filter((t) => t.projectId === projectId && !t.completed).length;
  };

  const getTasksWithoutProjectCount = (): number => {
    return tasks.filter((t) => !t.projectId && !t.completed).length;
  };

  const toggleProject = (projectId: string) => {
    const newSelection = selectedProjectIds.includes(projectId)
      ? selectedProjectIds.filter((id) => id !== projectId)
      : [...selectedProjectIds, projectId];
    onSelectionChange(newSelection, includeNoProject);
  };

  const toggleNoProject = () => {
    onSelectionChange(selectedProjectIds, !includeNoProject);
  };

  const clearFilters = () => {
    onSelectionChange([], false);
    setOpen(false);
  };

  const hasActiveFilters = selectedProjectIds.length > 0 || includeNoProject;
  const totalSelected =
    selectedProjectIds.length + (includeNoProject ? 1 : 0);

  const getFilterLabel = (): string => {
    if (!hasActiveFilters) return "Filter by project";
    if (totalSelected === 1) {
      if (includeNoProject) return "No project";
      const project = projects.find((p) => p.id === selectedProjectIds[0]);
      return project?.name || "1 project";
    }
    return `${totalSelected} selected`;
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between bg-background/50 border-white/10 rounded-lg hover:bg-white/5 text-white/70",
              hasActiveFilters && "border-primary/50 text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">{getFilterLabel()}</span>
            </div>
            <div className="flex items-center gap-1">
              {hasActiveFilters && (
                <X
                  className="w-4 h-4 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                />
              )}
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 p-0 bg-background border-white/10"
          align="start"
        >
          <div className="p-3 border-b border-white/10">
            <div className="text-xs text-white/40 uppercase font-medium">
              Filter by project
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={toggleNoProject}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                includeNoProject
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>No project</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">
                  ({getTasksWithoutProjectCount()})
                </span>
                {includeNoProject && <Check className="w-4 h-4 text-primary" />}
              </div>
            </button>
          </div>

          {activeProjects.length > 0 && (
            <>
              <div className="border-t border-white/10" />
              <div className="p-2 max-h-64 overflow-y-auto">
                {activeProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id);
                  const taskCount = getTaskCountForProject(project.id);

                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                        isSelected
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor: PROJECT_COLORS[project.color].solid
                          }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">
                          ({taskCount})
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {hasActiveFilters && (
            <>
              <div className="border-t border-white/10" />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  Clear filters
                </Button>
              </div>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

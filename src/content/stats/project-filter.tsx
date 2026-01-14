import { Filter, X, Check } from "lucide-react";
import { useState } from "react";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectFilterProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
}

export function ProjectFilter({
  projects,
  selectedProjectId,
  onSelectProject
}: ProjectFilterProps) {
  const [showMenu, setShowMenu] = useState(false);

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const handleSelect = (projectId: string | null) => {
    onSelectProject(projectId);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 bg-background/50 border rounded-lg transition-colors cursor-pointer",
          selectedProject
            ? "border-primary/50 text-white"
            : "border-white/10 text-white/70 hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          {selectedProject ? (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: PROJECT_COLORS[selectedProject.color].solid
                }}
              />
              <span className="text-sm truncate max-w-[150px]">
                {selectedProject.name}
              </span>
            </>
          ) : (
            <span className="text-sm">Filter by project</span>
          )}
        </div>
        {selectedProject && (
          <X
            className="w-4 h-4 hover:text-white shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProject(null);
            }}
          />
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 w-64 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2">
              <button
                onClick={() => handleSelect(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                  !selectedProjectId
                    ? "bg-primary/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <span>All projects</span>
                {!selectedProjectId && <Check className="w-4 h-4 ml-auto" />}
              </button>
            </div>
            {projects.length > 0 && (
              <>
                <div className="border-t border-white/10" />
                <div className="p-2 max-h-48 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelect(project.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                        selectedProjectId === project.id
                          ? "bg-primary/20 text-white"
                          : "text-white/70 hover:bg-white/5"
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{
                          backgroundColor: PROJECT_COLORS[project.color].solid
                        }}
                      />
                      <span className="truncate">{project.name}</span>
                      {selectedProjectId === project.id && (
                        <Check className="w-4 h-4 ml-auto shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

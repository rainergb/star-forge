import { useState } from "react";
import { Check, FolderOpen, X, Plus } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { PROJECT_COLORS } from "@/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
  className?: string;
}

export function ProjectSelector({
  selectedProjectId,
  onSelect,
  className
}: ProjectSelectorProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { projects, getProject, addProject } = useProjects();

  const activeProjects = projects.filter((p) => p.status === "active");
  const selectedProject = selectedProjectId
    ? getProject(selectedProjectId)
    : null;

  const handleSelect = (projectId: string | null) => {
    onSelect(projectId);
    setShowMenu(false);
    setIsCreating(false);
    setNewProjectName("");
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newId = addProject(newProjectName.trim());
      onSelect(newId);
      setShowMenu(false);
      setIsCreating(false);
      setNewProjectName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateProject();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewProjectName("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
      >
        {selectedProject ? (
          <div
            className="w-4 h-4 rounded-full"
            style={{
              backgroundColor: PROJECT_COLORS[selectedProject.color].solid
            }}
          />
        ) : (
          <FolderOpen className="w-4 h-4 text-white/50" />
        )}
        <span className="text-white/70 text-sm">
          {selectedProject ? selectedProject.name : "Add to project"}
        </span>
        {selectedProject && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(null);
            }}
            className="ml-auto text-white/30 hover:text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[200px]">
            <div className="py-1">
              <button
                onClick={() => handleSelect(null)}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                  !selectedProjectId
                    ? "text-primary bg-primary/10"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                <span>No project</span>
                {!selectedProjectId && <Check className="w-4 h-4 ml-auto" />}
              </button>
              {activeProjects.length > 0 && (
                <>
                  <div className="border-t border-white/10 my-1" />
                  {activeProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelect(project.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                        selectedProjectId === project.id
                          ? "text-primary bg-primary/10"
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
                </>
              )}
              {activeProjects.length === 0 && (
                <div className="px-4 py-2 text-white/40 text-sm">
                  No active projects
                </div>
              )}

              {/* Create new project */}
              <div className="border-t border-white/10 my-1" />
              {isCreating ? (
                <div className="px-3 py-2">
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Project name..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateProject}
                      disabled={!newProjectName.trim()}
                      className="flex-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewProjectName("");
                      }}
                      className="px-2 py-1 text-white/50 text-xs hover:text-white/70 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new project</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

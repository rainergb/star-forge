import { FloatingContainer } from "./floating-container";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { WidgetPosition } from "@/types/widget.types";
import { FolderKanban, Folder, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniProjectListProps {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onSelectProject?: (project: Project) => void;
  stackIndex?: number;
}

export function MiniProjectList({
  isVisible,
  isPinned,
  position,
  onClose,
  onTogglePin,
  onPositionChange,
  onSelectProject,
  stackIndex
}: MiniProjectListProps) {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const activeProjects = projects.filter((p) => p.status === "active");

  const getTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return {
      total: projectTasks.length,
      completed: projectTasks.filter((t) => t.completed).length
    };
  };

  if (!isVisible) return null;

  return (
    <FloatingContainer
      title="Projetos"
      isVisible={isVisible}
      isPinned={isPinned}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onPositionChange={onPositionChange}
      stackIndex={stackIndex}
    >
      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/40">
          <FolderKanban className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-xs">Nenhum projeto ativo</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[340px] scrollbar-none p-2 space-y-1">
          {activeProjects.map((project) => {
            const colors = PROJECT_COLORS[project.color];
            const counts = getTaskCounts(project.id);
            const progress =
              counts.total > 0 ? (counts.completed / counts.total) * 100 : 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject?.(project)}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-white/10 border border-transparent",
                  colors.border
                )}
              >
                <div className={cn("p-1.5 rounded", colors.bg)}>
                  <Folder className={cn("w-3.5 h-3.5", colors.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate">
                    {project.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <ListTodo className="w-3 h-3" />
                      {counts.completed}/{counts.total}
                    </span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden max-w-[60px]">
                      <div
                        className={cn("h-full rounded-full", colors.bg)}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FloatingContainer>
  );
}

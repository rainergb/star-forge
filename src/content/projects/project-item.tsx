import {
  Folder,
  ListTodo,
  Clock,
  Trash2,
  Archive,
  Play,
  Pause,
  CheckCircle
} from "lucide-react";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/shared/favorite-button";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  useContextMenu
} from "@/components/shared/context-menu";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived"
};

interface ProjectItemProps {
  project: Project;
  tasksCount: number;
  completedTasksCount: number;
  onClick: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}

export function ProjectItem({
  project,
  tasksCount,
  completedTasksCount,
  onClick,
  onToggleFavorite,
  onRemove
}: ProjectItemProps) {
  const { position: contextMenu, handleContextMenu, close: closeContextMenu } = useContextMenu();
  const colors = PROJECT_COLORS[project.color];
  const progress =
    tasksCount > 0 ? (completedTasksCount / tasksCount) * 100 : 0;

  const handleDelete = () => {
    onRemove();
    closeContextMenu();
  };

  return (
    <>
      <div
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "flex items-center justify-between px-4 py-3 bg-background/50 border rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
          colors.border,
          project.status === "archived" && "opacity-50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Folder className={cn("w-5 h-5", colors.text)} />
          </div>

          <div className="flex flex-col">
            <span className="text-white/90">{project.name}</span>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  colors.bg,
                  colors.text
                )}
              >
                {STATUS_LABELS[project.status]}
              </span>

              <span className="flex items-center gap-1 text-xs text-white/50">
                <ListTodo className="w-3 h-3" />
                {completedTasksCount}/{tasksCount}
              </span>

              {project.estimatedPomodoros && project.estimatedPomodoros > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#B57CFF]">
                  🍅 {project.completedPomodoros}/{project.estimatedPomodoros}
                </span>
              )}

              {project.totalTimeSpent > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#1A7FFF]">
                  <Clock className="w-3 h-3" />
                  {formatTime(project.totalTimeSpent)}
                </span>
              )}
            </div>

            {tasksCount > 0 && (
              <div className="mt-1.5 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    colors.bg
                  )}
                  style={{
                    width: `${progress}%`,
                    backgroundColor: colors.text.replace("text-", "")
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FavoriteButton
            isFavorite={project.favorite}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            color="purple"
          />
        </div>
      </div>

      <ContextMenu position={contextMenu} onClose={closeContextMenu}>
        <ContextMenuItem
          icon={<Play className="w-4 h-4 text-green-400" />}
          label="Activate project"
          onClick={closeContextMenu}
        />
        <ContextMenuItem
          icon={<Pause className="w-4 h-4 text-yellow-400" />}
          label="Pause project"
          onClick={closeContextMenu}
        />
        <ContextMenuItem
          icon={<CheckCircle className="w-4 h-4 text-blue-400" />}
          label="Complete project"
          onClick={closeContextMenu}
        />
        <ContextMenuItem
          icon={<Archive className="w-4 h-4 text-white/60" />}
          label="Archive project"
          onClick={closeContextMenu}
        />
        <ContextMenuDivider />
        <ContextMenuItem
          icon={<Trash2 className="w-4 h-4" />}
          label="Delete project"
          onClick={handleDelete}
          variant="danger"
        />
      </ContextMenu>
    </>
  );
}

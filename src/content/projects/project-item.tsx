import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Star,
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

interface ContextMenuPosition {
  x: number;
  y: number;
}

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
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  );
  const colors = PROJECT_COLORS[project.color];
  const progress =
    tasksCount > 0 ? (completedTasksCount / tasksCount) * 100 : 0;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

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
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="cursor-pointer text-white/30 hover:text-[#D6B8FF] transition-colors"
          >
            <Star
              className={cn(
                "w-5 h-5",
                project.favorite && "fill-[#D6B8FF] text-[#D6B8FF]"
              )}
            />
          </button>
        </div>
      </div>

      {contextMenu &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50" onClick={closeContextMenu} />
            <div
              className="fixed z-50 min-w-[200px] bg-[#2d2d2d] border border-white/10 rounded-lg shadow-xl py-1 animate-in fade-in-0 zoom-in-95"
              style={{
                left: contextMenu.x,
                top: contextMenu.y
              }}
            >
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer">
                <Play className="w-4 h-4 text-green-400" />
                Activate project
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer">
                <Pause className="w-4 h-4 text-yellow-400" />
                Pause project
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                Complete project
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors cursor-pointer">
                <Archive className="w-4 h-4 text-white/60" />
                Archive project
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4" />
                  Delete project
                </div>
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

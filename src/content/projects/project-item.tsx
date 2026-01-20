import {
  Folder,
  ListTodo,
  Clock,
  Trash2,
  Play,
  Pause,
  CheckCircle
} from "lucide-react";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { FavoriteButton } from "@/components/shared/favorite-button";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  useContextMenu
} from "@/components/shared/context-menu";
import {
  ListItem,
  ListItemTitle,
  ListItemMeta,
  ListItemBadge,
  ListItemStat,
  ListItemIcon
} from "@/components/shared/list-item";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const STATUS_LABELS = {
  active: "Active",
  paused: "Paused",
  completed: "Completed"
};

interface ProjectItemProps {
  project: Project;
  tasksCount: number;
  completedTasksCount: number;
  onClick: () => void;
  onDoubleClick?: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
}

export function ProjectItem({
  project,
  tasksCount,
  completedTasksCount,
  onClick,
  onDoubleClick,
  onToggleFavorite,
  onRemove
}: ProjectItemProps) {
  const { position: contextMenu, handleContextMenu, close: closeContextMenu } = useContextMenu();
  const colors = PROJECT_COLORS[project.color];
  const progress = tasksCount > 0 ? (completedTasksCount / tasksCount) * 100 : 0;

  const handleDelete = () => {
    onRemove();
    closeContextMenu();
  };

  return (
    <>
      <ListItem
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        coverImage={project.image}
        leading={
          <ListItemIcon
            icon={<Folder className="w-5 h-5" />}
            bgColor={colors.bg.replace("bg-", "")}
            color={colors.solid}
          />
        }
        trailing={
          <FavoriteButton
            isFavorite={project.favorite}
            onToggle={(e) => {
              e?.stopPropagation();
              onToggleFavorite();
            }}
            color="purple"
          />
        }
      >
        <ListItemTitle>{project.name}</ListItemTitle>
        <ListItemMeta>
          <ListItemBadge color={colors.solid} bgColor={`${colors.solid}20`}>
            {STATUS_LABELS[project.status]}
          </ListItemBadge>

          <ListItemStat icon={<ListTodo className="w-3 h-3" />}>
            {completedTasksCount}/{tasksCount}
          </ListItemStat>

          {project.estimatedPomodoros && project.estimatedPomodoros > 0 && (
            <ListItemStat icon={<span>🍅</span>} color="text-[#B57CFF]">
              {project.completedPomodoros}/{project.estimatedPomodoros}
            </ListItemStat>
          )}

          {project.totalTimeSpent > 0 && (
            <ListItemStat icon={<Clock className="w-3 h-3" />} color="text-[#1A7FFF]">
              {formatTime(project.totalTimeSpent)}
            </ListItemStat>
          )}
        </ListItemMeta>

        {tasksCount > 0 && (
          <div className="mt-1.5 w-32 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: colors.solid
              }}
            />
          </div>
        )}
      </ListItem>

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

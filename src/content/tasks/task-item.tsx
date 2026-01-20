import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Circle,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  Calendar,
  Trash2,
  ChevronLeft,
  Bell,
  Repeat,
  Timer,
  Clock
} from "lucide-react";
import { Task } from "@/types/task.types";
import { PROJECT_COLORS } from "@/types/project.types";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { enUS } from "date-fns/locale";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { usePersonalize } from "@/hooks/use-personalize";
import { useProjects } from "@/hooks/use-projects";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuDivider,
  useContextMenu
} from "@/components/shared/context-menu";
import { FavoriteButton } from "@/components/shared/favorite-button";
import {
  ListItem,
  ListItemTitle,
  ListItemMeta,
  ListItemBadge,
  ListItemStat,
  ListItemColorBar
} from "@/components/shared/list-item";
import successSound from "@/assets/sucess.mp3";

const formatDueDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MM/dd");
};

const formatReminderDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MM/dd");
};

const getRepeatLabel = (repeat: string): string => {
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly"
  };
  return labels[repeat] || repeat;
};

const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  if (minutes > 0) return `${minutes}m`;
  return "";
};

interface TaskItemProps {
  task: Task;
  isActive?: boolean;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetDueDate: (id: string, date: number | null) => void;
  onRemoveTask: (id: string) => void;
  onClick: () => void;
  onDoubleClick?: () => void;
  onFocus?: () => void;
  expectedEndTime?: string;
}

export function TaskItem({
  task,
  isActive,
  onToggleCompleted,
  onToggleFavorite,
  onSetDueDate,
  onRemoveTask,
  onClick,
  onDoubleClick,
  expectedEndTime
}: TaskItemProps) {
  const { position: contextMenu, handleContextMenu, close: closeContextMenu } = useContextMenu();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );

  const { settings: personalizeSettings } = usePersonalize();
  const { getProject } = useProjects();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const project = task.projectId ? getProject(task.projectId) : null;

  useEffect(() => {
    audioRef.current = new Audio(successSound);
    audioRef.current.volume =
      (personalizeSettings.notificationVolume ?? 50) / 100;
  }, [personalizeSettings.notificationVolume]);

  const playSuccessSound = () => {
    if (audioRef.current && personalizeSettings.notificationSound) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      playSuccessSound();
    }
    onToggleCompleted(task.id);
  };

  const handleSetDueToday = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    onSetDueDate(task.id, today.getTime());
    closeContextMenu();
  };

  const handleSetDueTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    onSetDueDate(task.id, tomorrow.getTime());
    closeContextMenu();
  };

  const handleChooseDate = () => {
    setShowDatePicker(true);
    closeContextMenu();
  };

  const handleDateSave = () => {
    if (selectedDate) {
      onSetDueDate(task.id, selectedDate.getTime());
    }
    setShowDatePicker(false);
  };

  const handleDelete = () => {
    onRemoveTask(task.id);
    closeContextMenu();
  };

  return (
    <>
      <ListItem
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        isActive={isActive}
        isDisabled={task.completed}
        coverImage={task.image}
        leading={
          <>
            {project && (
              <ListItemColorBar
                color={PROJECT_COLORS[project.color].solid}
              />
            )}
            <button
              onClick={handleToggleCompleted}
              className="cursor-pointer text-white/70 hover:text-white transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          </>
        }
        trailing={
          <>
            {expectedEndTime && !task.completed && (
              <span className="text-[10px] text-white/30 whitespace-nowrap">
                ~{expectedEndTime}
              </span>
            )}
            <FavoriteButton
              isFavorite={task.favorite}
              onToggle={() => onToggleFavorite(task.id)}
              color="purple"
            />
          </>
        }
      >
        <ListItemTitle strikethrough={task.completed}>{task.title}</ListItemTitle>
        <ListItemMeta>
          {project && (
            <ListItemBadge
              color={PROJECT_COLORS[project.color].solid}
              bgColor={`${PROJECT_COLORS[project.color].solid}20`}
            >
              {project.name}
            </ListItemBadge>
          )}
          <span className="text-xs text-white/40">{task.category}</span>
          {task.dueDate && (
            <ListItemStat
              icon={<Calendar className="w-3 h-3" />}
              color={isPast(new Date(task.dueDate)) && !task.completed ? "text-red-400" : "text-white/50"}
            >
              {formatDueDate(task.dueDate)}
            </ListItemStat>
          )}
          {task.reminder && (
            <ListItemStat icon={<Bell className="w-3 h-3" />} color="text-[#1A7FFF]">
              {formatReminderDate(task.reminder.date)}
            </ListItemStat>
          )}
          {task.repeat && (
            <ListItemStat icon={<Repeat className="w-3 h-3" />} color="text-[#B57CFF]">
              {getRepeatLabel(task.repeat)}
            </ListItemStat>
          )}
          {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
            <ListItemStat icon={<Timer className="w-3 h-3" />} color="text-[#B57CFF]">
              {task.completedPomodoros ?? 0}/{task.estimatedPomodoros}
            </ListItemStat>
          )}
          {task.totalTimeSpent > 0 && (
            <ListItemStat icon={<Clock className="w-3 h-3" />} color="text-[#1A7FFF]">
              {formatTimeSpent(task.totalTimeSpent)}
            </ListItemStat>
          )}
        </ListItemMeta>
      </ListItem>

      <ContextMenu position={contextMenu} onClose={closeContextMenu}>
        <ContextMenuItem
          icon={<CalendarCheck className="w-4 h-4" />}
          label="Due today"
          onClick={handleSetDueToday}
        />
        <ContextMenuItem
          icon={<CalendarDays className="w-4 h-4" />}
          label="Due tomorrow"
          onClick={handleSetDueTomorrow}
        />
        <ContextMenuItem
          icon={<Calendar className="w-4 h-4" />}
          label="Choose date"
          onClick={handleChooseDate}
        />
        <ContextMenuDivider />
        <ContextMenuItem
          icon={<Trash2 className="w-4 h-4" />}
          label="Delete task"
          onClick={handleDelete}
          variant="danger"
        />
      </ContextMenu>

      {showDatePicker &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowDatePicker(false)}
            />
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-white/50 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white/80 text-sm font-medium">
                  Choose date
                </span>
              </div>

              <CalendarPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={enUS}
                initialFocus
              />

              <div className="flex gap-2 border-t border-white/10 p-4">
                <Button
                  variant="ghost"
                  className="flex-1 text-white/70"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary/80 hover:bg-primary text-white"
                  onClick={handleDateSave}
                  disabled={!selectedDate}
                >
                  Save
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

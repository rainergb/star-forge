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
import { cn } from "@/lib/utils";
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
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();
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
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={openContextMenu}
        className={cn(
          "flex items-center justify-between px-4 py-3 bg-background/50 border rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
          isActive ? "border-primary/50 bg-primary/5" : "border-white/10",
          task.completed && "opacity-50"
        )}
      >
        <div className="flex items-center gap-3">
          {project && (
            <div
              className="w-2 h-8 rounded-full shrink-0"
              style={{ backgroundColor: PROJECT_COLORS[project.color].solid }}
              title={project.name}
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

          <div className="flex flex-col">
            <span
              className={`text-white/90 ${
                task.completed ? "line-through text-white/50" : ""
              }`}
            >
              {task.title}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {project && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${PROJECT_COLORS[project.color].solid}20`,
                    color: PROJECT_COLORS[project.color].solid
                  }}
                >
                  {project.name}
                </span>
              )}
              <span className="text-xs text-white/40">{task.category}</span>
              {task.dueDate && (
                <span
                  className={`flex items-center gap-1 text-xs ${
                    isPast(new Date(task.dueDate)) && !task.completed
                      ? "text-red-400"
                      : "text-white/50"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
              {task.reminder && (
                <span className="flex items-center gap-1 text-xs text-[#1A7FFF]">
                  <Bell className="w-3 h-3" />
                  {formatReminderDate(task.reminder.date)}
                </span>
              )}
              {task.repeat && (
                <span className="flex items-center gap-1 text-xs text-[#B57CFF]">
                  <Repeat className="w-3 h-3" />
                  {getRepeatLabel(task.repeat)}
                </span>
              )}
              {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#B57CFF]">
                  <Timer className="w-3 h-3" />
                  {task.completedPomodoros ?? 0}/{task.estimatedPomodoros}
                </span>
              )}
              {task.totalTimeSpent > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#1A7FFF]">
                  <Clock className="w-3 h-3" />
                  {formatTimeSpent(task.totalTimeSpent)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      <ContextMenu position={contextMenu} onClose={closeContextMenu}>
        <ContextMenuItem
          icon={CalendarCheck}
          label="Due today"
          onClick={handleSetDueToday}
        />
        <ContextMenuItem
          icon={CalendarDays}
          label="Due tomorrow"
          onClick={handleSetDueTomorrow}
        />
        <ContextMenuItem
          icon={Calendar}
          label="Choose date"
          onClick={handleChooseDate}
        />
        <ContextMenuDivider />
        <ContextMenuItem
          icon={Trash2}
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

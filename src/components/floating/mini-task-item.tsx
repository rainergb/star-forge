import { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task.types";
import { Button } from "@/components/ui/button";
import { usePersonalize } from "@/hooks/use-personalize";
import successSound from "@/assets/sucess.mp3";

interface MiniTaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export function MiniTaskItem({
  task,
  isActive,
  onSelect,
  onToggleComplete
}: MiniTaskItemProps) {
  const { settings: personalizeSettings } = usePersonalize();
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleToggleComplete = () => {
    if (!task.completed) {
      playSuccessSound();
    }
    onToggleComplete(task.id);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const progress =
    task.estimatedPomodoros && task.estimatedPomodoros > 0
      ? Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100)
      : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-lg",
        "transition-colors duration-150",
        "group",
        isDragging && "opacity-50 bg-white/10",
        isActive
          ? "bg-primary/20 border border-primary/30"
          : "hover:bg-white/5"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className={cn(
          "touch-none cursor-grab active:cursor-grabbing",
          "text-white/30 hover:text-white/70",
          "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 shrink-0"
        onClick={handleToggleComplete}
      >
        {task.completed ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Circle className="h-3.5 w-3.5 text-white/40" />
        )}
      </Button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !task.completed && onSelect(task)}
      >
        <p
          className={cn(
            "text-xs truncate text-white/90",
            task.completed && "line-through text-white/40"
          )}
        >
          {task.title}
        </p>
        {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40 whitespace-nowrap">
              {task.completedPomodoros ?? 0}/{task.estimatedPomodoros}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

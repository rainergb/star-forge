import { useRef, useEffect } from "react";
import { Circle, CheckCircle2 } from "lucide-react";
import { Task } from "@/types/task.types";
import { usePersonalize } from "@/hooks/use-personalize";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { EditableTitle } from "@/components/shared/editable-title";
import { CoverImageBanner } from "@/components/shared/cover-image-banner";
import successSound from "@/assets/sucess.mp3";

interface TaskHeaderProps {
  task: Task;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateTitle: (title: string) => void;
  onUpdateImage: (image: string | null) => void;
}

export function TaskHeader({
  task,
  onToggleCompleted,
  onToggleFavorite,
  onUpdateTitle,
  onUpdateImage
}: TaskHeaderProps) {
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

  const handleToggleCompleted = () => {
    if (!task.completed) {
      playSuccessSound();
    }
    onToggleCompleted(task.id);
  };

  return (
    <div className="border-b border-white/10">
      <CoverImageBanner
        image={task.image}
        alt={task.title}
        onUpdateImage={onUpdateImage}
        height="md"
      />

      <div className="flex items-center gap-3 p-4">
        <button
          onClick={handleToggleCompleted}
          className="cursor-pointer text-white/70 hover:text-white transition-colors shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <EditableTitle
          value={task.title}
          onChange={onUpdateTitle}
          mode="always-editable"
          inputClassName={`text-lg ${task.completed ? "line-through text-white/50" : ""}`}
        />

        <FavoriteButton
          isFavorite={task.favorite}
          onToggle={() => onToggleFavorite(task.id)}
          color="purple"
        />
      </div>
    </div>
  );
}

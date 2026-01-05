import { useRef, useEffect } from "react";
import { Circle, CheckCircle2, Star } from "lucide-react";
import { Task } from "@/types/task.types";
import { usePersonalize } from "@/hooks/use-personalize";
import successSound from "@/assets/sucess.mp3";

interface TaskHeaderProps {
  task: Task;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateTitle: (title: string) => void;
}

export function TaskHeader({
  task,
  onToggleCompleted,
  onToggleFavorite,
  onUpdateTitle
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
    <div className="flex items-center gap-3 pr-8">
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

      <input
        type="text"
        value={task.title}
        onChange={(e) => onUpdateTitle(e.target.value)}
        className={`flex-1 text-lg bg-transparent border-none outline-none text-white ${
          task.completed ? "line-through text-white/50" : ""
        }`}
      />

      <button
        onClick={() => onToggleFavorite(task.id)}
        className="cursor-pointer text-white/30 hover:text-[#D6B8FF] transition-colors flex-shrink-0"
      >
        <Star
          className={`w-5 h-5 ${
            task.favorite ? "fill-[#D6B8FF] text-[#D6B8FF]" : ""
          }`}
        />
      </button>
    </div>
  );
}

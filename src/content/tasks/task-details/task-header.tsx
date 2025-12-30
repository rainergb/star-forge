import { Circle, CheckCircle2, Star } from "lucide-react";
import { Task } from "@/types/task.types";

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
  return (
    <div className="flex items-start gap-3 pr-8">
      <button
        onClick={() => onToggleCompleted(task.id)}
        className="cursor-pointer text-white/70 hover:text-white transition-colors mt-1"
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
        className="cursor-pointer text-white/30 hover:text-yellow-400 transition-colors"
      >
        <Star
          className={`w-5 h-5 ${
            task.favorite ? "fill-yellow-400 text-yellow-400" : ""
          }`}
        />
      </button>
    </div>
  );
}

import { Circle, CheckCircle2, X } from "lucide-react";
import { TaskStep } from "@/types/task.types";

interface TaskStepItemProps {
  step: TaskStep;
  onToggle: () => void;
  onRemove: () => void;
}

export function TaskStepItem({ step, onToggle, onRemove }: TaskStepItemProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded-lg group">
      <button
        onClick={onToggle}
        className="cursor-pointer text-white/50 hover:text-white transition-colors"
      >
        {step.completed ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : (
          <Circle className="w-4 h-4" />
        )}
      </button>

      <span
        className={`flex-1 text-sm ${
          step.completed ? "line-through text-white/40" : "text-white/70"
        }`}
      >
        {step.title}
      </span>

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 cursor-pointer text-white/30 hover:text-red-400 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

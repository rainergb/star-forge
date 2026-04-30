import { useState } from "react";
import { Circle, CheckCircle2, X } from "lucide-react";
import { TaskStep } from "@/types/task.types";

interface TaskStepItemProps {
  step: TaskStep;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (stepId: string, newTitle: string) => void;
}

export function TaskStepItem({ step, onToggle, onRemove, onUpdate }: TaskStepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(step.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== step.title) {
      onUpdate(step.id, editTitle.trim());
    }
    setEditTitle(step.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditTitle(step.title);
      setIsEditing(false);
    }
  };

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

      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white outline-none hover:border-white/40 focus:border-primary"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-sm cursor-pointer hover:opacity-80 transition-opacity ${
            step.completed ? "line-through text-white/40" : "text-white/70"
          }`}
        >
          {step.title}
        </span>
      )}

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 cursor-pointer text-white/30 hover:text-red-400 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

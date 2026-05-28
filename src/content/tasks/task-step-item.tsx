import { useState, useEffect } from "react";
import { Circle, CheckCircle2, X } from "lucide-react";
import { TaskStep } from "@/types/task.types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskStepItemProps {
  step: TaskStep;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (stepId: string, newTitle: string) => void;
}

export function TaskStepItem({ step, onToggle, onRemove, onUpdate }: TaskStepItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(step.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  useEffect(() => {
    if (!isEditing) {
      setEditTitle(step.title);
    }
  }, [step.title, isEditing]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== step.title) {
      onUpdate(step.id, trimmed);
    } else {
      setEditTitle(step.title);
    }
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!isEditing ? listeners : {})}
      className={`flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded-lg group ${
        !isEditing ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="cursor-pointer text-white/50 hover:text-white transition-colors flex-shrink-0"
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
          className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white outline-none hover:border-white/40 focus:border-primary cursor-text"
        />
      ) : (
        <span
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
          className={`flex-1 text-sm select-none cursor-text ${
            step.completed ? "line-through text-white/40" : "text-white/70"
          }`}
          title="Double-click to edit"
        >
          {step.title}
        </span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 cursor-pointer text-white/30 hover:text-red-400 transition-all flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

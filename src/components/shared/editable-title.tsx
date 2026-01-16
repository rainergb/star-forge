import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTitleProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  showEditIcon?: boolean;
  mode?: "click-to-edit" | "always-editable";
}

export function EditableTitle({
  value,
  onChange,
  className,
  inputClassName,
  placeholder = "Untitled",
  showEditIcon = true,
  mode = "click-to-edit"
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  // Modo sempre editável (controlled input)
  if (mode === "always-editable") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent border-none outline-none text-white",
          inputClassName
        )}
      />
    );
  }

  // Modo click-to-edit
  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className={cn(
          "w-full bg-transparent text-xl font-semibold text-white focus:outline-none border-b border-primary",
          inputClassName
        )}
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <h2 className="text-xl font-semibold text-white truncate">
        {value || placeholder}
      </h2>
      {showEditIcon && (
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all cursor-pointer"
        >
          <Pencil className="w-4 h-4 text-white/50" />
        </button>
      )}
    </div>
  );
}

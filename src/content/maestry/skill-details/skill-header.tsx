import { useState, useRef } from "react";
import { Pencil, ImagePlus, X } from "lucide-react";
import { Skill, SKILL_COLORS } from "@/types/skill.types";

interface SkillHeaderProps {
  skill: Skill;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string | null) => void;
}

export function SkillHeader({ skill, onUpdateName, onUpdateImage }: SkillHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(skill.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== skill.name) {
      onUpdateName(trimmed);
    } else {
      setEditValue(skill.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(skill.name);
      setIsEditing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-b border-white/10">
      {/* Image Banner */}
      <div className="relative">
        {skill.image ? (
          <div className="relative group">
            <img
              src={skill.image}
              alt={skill.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer"
              >
                <ImagePlus className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onUpdateImage(null)}
                className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/40 hover:text-white/60 cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm">Add cover image</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Header Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              backgroundColor: `${SKILL_COLORS[skill.color].solid}20`,
              color: SKILL_COLORS[skill.color].solid
            }}
          >
            {skill.icon.type === "emoji" ? (
              skill.icon.value
            ) : (
              <span className="text-sm font-bold">
                {skill.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-transparent text-xl font-semibold text-white focus:outline-none border-b border-primary"
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl font-semibold text-white truncate">
                  {skill.name}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-white/50" />
                </button>
              </div>
            )}

            {skill.description && (
              <p className="text-white/50 text-sm mt-1 line-clamp-2">
                {skill.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

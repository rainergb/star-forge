import { useState, useRef } from "react";
import { Star, Folder, ImagePlus, X } from "lucide-react";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  project: Project;
  onToggleFavorite: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string | null) => void;
  onUpdateImage: (image: string | null) => void;
}

export function ProjectHeader({
  project,
  onToggleFavorite,
  onUpdateName,
  onUpdateDescription,
  onUpdateImage
}: ProjectHeaderProps) {
  const [editedDescription, setEditedDescription] = useState(
    project.description || ""
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = PROJECT_COLORS[project.color];

  const handleSaveDescription = () => {
    const newDesc = editedDescription.trim() || null;
    if (newDesc !== project.description) {
      onUpdateDescription(newDesc);
    }
    setIsEditingDescription(false);
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
    <div className="space-y-4">
      {/* Image Banner */}
      <div className="relative -mx-6 -mt-6 mb-4">
        {project.image ? (
          <div className="relative group">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ImagePlus className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => onUpdateImage(null)}
                className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/40 hover:text-white/60"
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

      <div className="flex items-center gap-3 pr-8">
        <div className={cn("p-2 rounded-lg shrink-0", colors.bg)}>
          <Folder className={cn("w-6 h-6", colors.text)} />
        </div>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={project.name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="w-full text-lg bg-transparent border-none outline-none text-white"
          />

          {isEditingDescription ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onBlur={handleSaveDescription}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditedDescription(project.description || "");
                  setIsEditingDescription(false);
                }
              }}
              placeholder="Add description..."
              className="w-full mt-1 bg-transparent text-sm text-white/60 border-b border-primary/50 focus:outline-none resize-none"
              rows={1}
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingDescription(true)}
              className="text-sm text-white/50 cursor-pointer hover:text-white/70 truncate"
            >
              {project.description || "Click to add description..."}
            </p>
          )}
        </div>

        <button
          onClick={onToggleFavorite}
          className="cursor-pointer text-white/30 hover:text-[#D6B8FF] transition-colors shrink-0"
        >
          <Star
            className={cn(
              "w-5 h-5",
              project.favorite && "fill-[#D6B8FF] text-[#D6B8FF]"
            )}
          />
        </button>
      </div>
    </div>
  );
}

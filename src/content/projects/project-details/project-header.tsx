import { useState } from "react";
import { Project, ProjectIcon, ProjectColor } from "@/types/project.types";
import { CoverImageBanner } from "@/components/shared/cover-image-banner";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { EditableTitle } from "@/components/shared/editable-title";
import { ProjectIconColorSelector } from "../project-icon-color-selector";

interface ProjectHeaderProps {
  project: Project;
  onToggleFavorite: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string | null) => void;
  onUpdateImage: (image: string | null) => void;
  onUpdateIcon: (icon: ProjectIcon) => void;
  onUpdateColor: (color: ProjectColor) => void;
}

export function ProjectHeader({
  project,
  onToggleFavorite,
  onUpdateName,
  onUpdateDescription,
  onUpdateImage,
  onUpdateIcon,
  onUpdateColor
}: ProjectHeaderProps) {
  const [editedDescription, setEditedDescription] = useState(
    project.description || ""
  );
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const handleSaveDescription = () => {
    const newDesc = editedDescription.trim() || null;
    if (newDesc !== project.description) {
      onUpdateDescription(newDesc);
    }
    setIsEditingDescription(false);
  };

  return (
    <div className="border-b border-white/10">
      {/* Image Banner */}
      <CoverImageBanner
        image={project.image}
        alt={project.name}
        onUpdateImage={onUpdateImage}
        height="md"
      />

      <div className="flex items-center gap-3 p-4">
        <ProjectIconColorSelector
          icon={project.icon}
          color={project.color}
          onChangeIcon={onUpdateIcon}
          onChangeColor={onUpdateColor}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <EditableTitle
            value={project.name}
            onChange={onUpdateName}
            mode="always-editable"
            inputClassName="text-lg"
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

        <FavoriteButton
          isFavorite={project.favorite}
          onToggle={onToggleFavorite}
          color="purple"
        />
      </div>
    </div>
  );
}

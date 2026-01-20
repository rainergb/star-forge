import { useState } from "react";
import { ProjectColor, PROJECT_COLORS } from "@/types/project.types";
import { ControlledListInput, ColorPickerAction } from "@/components/shared/list-input";

interface ProjectInputProps {
  onAddProject: (
    name: string,
    options?: {
      color?: ProjectColor;
    }
  ) => void;
}

const colorOptions: ProjectColor[] = [
  "purple",
  "blue",
  "green",
  "orange",
  "red",
  "pink",
  "cyan",
  "yellow"
];

export function ProjectInput({ onAddProject }: ProjectInputProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState<ProjectColor>("purple");

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim(), {
        color: selectedColor
      });
      setNewProjectName("");
      setSelectedColor("purple");
    }
  };

  return (
    <ControlledListInput
      value={newProjectName}
      onChange={setNewProjectName}
      onSubmit={handleAddProject}
      placeholder="Add new project..."
      actions={
        <div className="flex items-center gap-1">
          <ColorPickerAction
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            colors={colorOptions}
            getColorStyle={(color) => PROJECT_COLORS[color].solid}
          />
        </div>
      }
    />
  );
}

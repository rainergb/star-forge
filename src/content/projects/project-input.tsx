import { useState } from "react";
import { ProjectColor, PROJECT_COLORS } from "@/types/project.types";

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
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim(), {
        color: selectedColor
      });
      setNewProjectName("");
      setSelectedColor("purple");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddProject();
    }
  };

  return (
    <div className="w-full relative">
      <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new project..."
          className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
        {newProjectName.trim() && (
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-white/5"
                title="Choose color"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: PROJECT_COLORS[selectedColor].solid }}
                />
              </button>

              {showColorPicker && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg p-2 z-20 grid grid-cols-4 gap-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-pointer ${
                          selectedColor === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d3a]"
                            : ""
                        }`}
                        style={{ backgroundColor: PROJECT_COLORS[color].solid }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

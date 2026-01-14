import { useState } from "react";
import { SkillColor, SKILL_COLORS } from "@/types/skill.types";

interface SkillInputProps {
  onAddSkill: (
    name: string,
    options: {
      color: SkillColor;
      description: string | null;
    }
  ) => void;
}

const colorOptions: SkillColor[] = [
  "purple",
  "blue",
  "green",
  "orange",
  "red",
  "pink",
  "cyan",
  "yellow"
];

export function SkillInput({ onAddSkill }: SkillInputProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [selectedColor, setSelectedColor] = useState<SkillColor>("purple");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      onAddSkill(newSkillName.trim(), {
        color: selectedColor,
        description: null
      });
      setNewSkillName("");
      setSelectedColor("purple");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  return (
    <div className="w-full relative">
      <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add new skill..."
          className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
        {newSkillName.trim() && (
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-white/5"
                title="Choose color"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: SKILL_COLORS[selectedColor].solid }}
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
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                          selectedColor === color
                            ? "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d3a]"
                            : ""
                        }`}
                        style={{ backgroundColor: SKILL_COLORS[color].solid }}
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

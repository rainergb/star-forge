import { useState } from "react";
import { SkillColor, SKILL_COLORS } from "@/types/skill.types";
import { ControlledListInput, ColorPickerAction } from "@/components/shared/list-input";

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

  return (
    <ControlledListInput
      value={newSkillName}
      onChange={setNewSkillName}
      onSubmit={handleAddSkill}
      placeholder="Add new skill..."
      actions={
        <div className="flex items-center gap-1">
          <ColorPickerAction
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
            colors={colorOptions}
            getColorStyle={(color) => SKILL_COLORS[color].solid}
          />
        </div>
      }
    />
  );
}

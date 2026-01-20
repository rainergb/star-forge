import { useState } from "react";
import { ControlledListInput } from "@/components/shared/list-input";
import { SkillColor } from "@/types/skill.types";

interface SkillInputProps {
  onAddSkill: (
    name: string,
    options: {
      color: SkillColor;
      description: string | null;
    }
  ) => void;
}

export function SkillInput({ onAddSkill }: SkillInputProps) {
  const [newSkillName, setNewSkillName] = useState("");

  const handleAddSkill = () => {
    if (newSkillName.trim()) {
      onAddSkill(newSkillName.trim(), {
        color: "purple",
        description: null
      });
      setNewSkillName("");
    }
  };

  return (
    <ControlledListInput
      value={newSkillName}
      onChange={setNewSkillName}
      onSubmit={handleAddSkill}
      placeholder="Add new skill..."
    />
  );
}

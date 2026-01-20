import { useState } from "react";
import { ControlledListInput } from "@/components/shared/list-input";

interface ProjectInputProps {
  onAddProject: (name: string) => void;
}

export function ProjectInput({ onAddProject }: ProjectInputProps) {
  const [newProjectName, setNewProjectName] = useState("");

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName("");
    }
  };

  return (
    <ControlledListInput
      value={newProjectName}
      onChange={setNewProjectName}
      onSubmit={handleAddProject}
      placeholder="Add new project..."
    />
  );
}

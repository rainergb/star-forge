import { useState } from "react";
import { Plus } from "lucide-react";
import { Task } from "@/types/task.types";
import { TaskStepItem } from "../task-step-item";

interface TaskStepsSectionProps {
  task: Task;
  onAddStep: (taskId: string, stepTitle: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onRemoveStep: (taskId: string, stepId: string) => void;
}

export function TaskStepsSection({
  task,
  onAddStep,
  onToggleStep,
  onRemoveStep
}: TaskStepsSectionProps) {
  const [newStepTitle, setNewStepTitle] = useState("");

  const handleAddStep = () => {
    if (newStepTitle.trim()) {
      onAddStep(task.id, newStepTitle.trim());
      setNewStepTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddStep();
    }
  };

  return (
    <div className="mt-6 space-y-1">
      <div className="flex items-center gap-2 px-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
        <Plus className="w-4 h-4 text-white/50" />
        <input
          type="text"
          value={newStepTitle}
          onChange={(e) => setNewStepTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add step"
          className="flex-1 bg-transparent border-none outline-none text-white/70 text-sm placeholder-white/40"
        />
      </div>

      {(task.steps || []).map((step) => (
        <TaskStepItem
          key={step.id}
          step={step}
          onToggle={() => onToggleStep(task.id, step.id)}
          onRemove={() => onRemoveStep(task.id, step.id)}
        />
      ))}
    </div>
  );
}

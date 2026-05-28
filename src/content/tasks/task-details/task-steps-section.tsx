import { useState } from "react";
import { Plus } from "lucide-react";
import { Task } from "@/types/task.types";
import { TaskStepItem } from "../task-step-item";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from "@dnd-kit/sortable";

interface TaskStepsSectionProps {
  task: Task;
  onAddStep: (taskId: string, stepTitle: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onRemoveStep: (taskId: string, stepId: string) => void;
  onUpdateStep: (taskId: string, stepId: string, newTitle: string) => void;
  onReorderSteps: (taskId: string, fromIndex: number, toIndex: number) => void;
}

export function TaskStepsSection({
  task,
  onAddStep,
  onToggleStep,
  onRemoveStep,
  onUpdateStep,
  onReorderSteps
}: TaskStepsSectionProps) {
  const [newStepTitle, setNewStepTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const steps = task.steps || [];

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = steps.findIndex((s) => s.id === active.id);
    const toIndex = steps.findIndex((s) => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorderSteps(task.id, fromIndex, toIndex);
    }
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4 px-4 space-y-1">
      <div className="flex items-center gap-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {steps.map((step) => (
            <TaskStepItem
              key={step.id}
              step={step}
              onToggle={() => onToggleStep(task.id, step.id)}
              onRemove={() => onRemoveStep(task.id, step.id)}
              onUpdate={(stepId, newTitle) => onUpdateStep(task.id, stepId, newTitle)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

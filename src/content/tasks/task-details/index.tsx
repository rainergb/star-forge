import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Task, TaskReminder, TaskFile } from "@/types/task.types";
import { TaskHeader } from "./task-header";
import { TaskStepsSection } from "./task-steps-section";
import { TaskActionsSection } from "./task-actions-section";
import { TaskNotesSection } from "./task-notes-section";
import { TaskFooter } from "./task-footer";

interface TaskDetailsProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleCompleted: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  onAddStep: (taskId: string, stepTitle: string) => void;
  onToggleStep: (taskId: string, stepId: string) => void;
  onRemoveStep: (taskId: string, stepId: string) => void;
  onSetDueDate: (taskId: string, dueDate: number | null) => void;
  onSetReminder: (taskId: string, reminder: TaskReminder | null) => void;
  onAddFile: (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => void;
  onRemoveFile: (taskId: string, fileId: string) => void;
  onAddNote: (taskId: string, content: string) => void;
  onUpdateNote: (taskId: string, noteId: string, content: string) => void;
  onRemoveNote: (taskId: string, noteId: string) => void;
  onRemoveTask: (id: string) => void;
}

export function TaskDetails({
  task,
  open,
  onOpenChange,
  onToggleCompleted,
  onToggleFavorite,
  onUpdateTask,
  onAddStep,
  onToggleStep,
  onRemoveStep,
  onSetDueDate,
  onSetReminder,
  onAddFile,
  onRemoveFile,
  onAddNote,
  onUpdateNote,
  onRemoveNote,
  onRemoveTask
}: TaskDetailsProps) {
  const handleDelete = () => {
    if (!task) return;
    onRemoveTask(task.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-white/10 text-white flex flex-col">
        {task && (
          <>
            <div className="flex-1 overflow-y-auto">
              <TaskHeader
                task={task}
                onToggleCompleted={onToggleCompleted}
                onToggleFavorite={onToggleFavorite}
                onUpdateTitle={(title) => onUpdateTask(task.id, { title })}
              />

              <TaskStepsSection
                task={task}
                onAddStep={onAddStep}
                onToggleStep={onToggleStep}
                onRemoveStep={onRemoveStep}
              />

              <TaskActionsSection
                task={task}
                onSetReminder={onSetReminder}
                onSetDueDate={onSetDueDate}
                onAddFile={onAddFile}
                onRemoveFile={onRemoveFile}
              />

              <TaskNotesSection
                notes={task.notes}
                onAddNote={(content) => onAddNote(task.id, content)}
                onUpdateNote={(noteId, content) => onUpdateNote(task.id, noteId, content)}
                onRemoveNote={(noteId) => onRemoveNote(task.id, noteId)}
              />
            </div>

            <TaskFooter
              createdAt={task.createdAt}
              onDelete={handleDelete}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

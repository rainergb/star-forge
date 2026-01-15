import { useState } from "react";
import { CheckSquare, ExternalLink } from "lucide-react";
import { DiaryEntry } from "@/types/diary.types";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";

interface DiaryActionsSectionProps {
  entry: DiaryEntry;
  onLinkTask: (taskId: string) => void;
}

export function DiaryActionsSection({
  entry,
  onLinkTask
}: DiaryActionsSectionProps) {
  const { addTask, tasks } = useTasks();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState(entry.content.slice(0, 100));

  const linkedTask = entry.linkedTaskId
    ? tasks.find((t) => t.id === entry.linkedTaskId)
    : null;

  const handleCreateTask = () => {
    if (!taskTitle.trim()) return;

    const taskId = addTask(taskTitle.trim(), "Tasks");
    onLinkTask(taskId);
    setIsCreatingTask(false);
  };

  if (entry.type === "task-created" || entry.type === "task-completed") {
    return (
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-3">
          <CheckSquare className="w-4 h-4" />
          Linked Task
        </h3>

        {linkedTask ? (
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckSquare
                className={cn(
                  "w-4 h-4",
                  linkedTask.completed ? "text-green-400" : "text-white/40"
                )}
              />
              <span
                className={cn(
                  "text-sm",
                  linkedTask.completed
                    ? "text-white/50 line-through"
                    : "text-white/90"
                )}
              >
                {linkedTask.title}
              </span>
            </div>
            <button className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-white/40">Task not found</p>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <h3 className="text-sm font-medium text-white/70 flex items-center gap-2 mb-3">
        <CheckSquare className="w-4 h-4" />
        Actions
      </h3>

      {entry.linkedTaskId ? (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckSquare className="w-4 h-4" />
          Task created from this entry
        </div>
      ) : isCreatingTask ? (
        <div className="space-y-2">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-primary/50"
            autoFocus
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setIsCreatingTask(false)}
              className="px-3 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              disabled={!taskTitle.trim()}
              className="px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            >
              Create Task
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreatingTask(true)}
          className="flex items-center gap-2 px-3 py-2 w-full bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          Create task from this entry
        </button>
      )}
    </div>
  );
}

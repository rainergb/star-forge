import { useState } from "react";
import {
  Plus,
  X,
  Circle,
  CheckCircle2,
  ExternalLink,
  ListTodo,
  Pencil,
  Check
} from "lucide-react";
import { Task } from "@/types/task.types";

interface ProjectTasksSectionProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onRemoveFromProject: (taskId: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onNavigateToTasks?: () => void;
}

export function ProjectTasksSection({
  tasks,
  onAddTask,
  onRemoveFromProject,
  onUpdateTaskTitle,
  onToggleComplete,
  onNavigateToTasks
}: ProjectTasksSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = () => {
    if (editingTaskId && editingTitle.trim()) {
      onUpdateTaskTitle(editingTaskId, editingTitle.trim());
    }
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="mt-4 border-t border-white/10 pt-4 px-4 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/50">
          <ListTodo className="w-4 h-4" />
          <span className="text-sm">Tasks</span>
          {tasks.length > 0 && (
            <span className="text-xs text-white/30">({tasks.length})</span>
          )}
        </div>
        {onNavigateToTasks && tasks.length > 0 && (
          <button
            onClick={onNavigateToTasks}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            View all
          </button>
        )}
      </div>

      <div className="space-y-1 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 py-2 hover:bg-white/5 rounded-lg cursor-pointer">
          <Plus className="w-4 h-4 text-white/50" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add task"
            className="flex-1 bg-transparent border-none outline-none text-white/70 text-sm placeholder-white/40"
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none space-y-1 pb-4">
          {tasks.length === 0 ? (
            <div className="text-center text-white/30 py-4 text-sm">
              Click to add a task
            </div>
          ) : (
            <>
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 py-2 rounded-lg hover:bg-white/5"
                >
                  <button
                    onClick={() => onToggleComplete?.(task.id)}
                    className="text-white/40 hover:text-primary cursor-pointer transition-colors"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  {editingTaskId === task.id ? (
                    <>
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        onBlur={saveEdit}
                        autoFocus
                        className="flex-1 bg-white/5 border border-white/20 rounded px-2 py-0.5 outline-none text-white/90 text-sm"
                      />
                      <button
                        onClick={saveEdit}
                        className="text-primary hover:text-primary/80 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span
                        className="flex-1 text-sm text-white/70 truncate cursor-pointer"
                        onDoubleClick={() => startEditing(task)}
                      >
                        {task.title}
                      </span>
                      <button
                        onClick={() => startEditing(task)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 cursor-pointer transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveFromProject(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 cursor-pointer transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}

              {completedTasks.length > 0 && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <span className="text-xs text-white/30">
                    Completed ({completedTasks.length})
                  </span>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 py-2 rounded-lg hover:bg-white/5 opacity-50"
                    >
                      <button
                        onClick={() => onToggleComplete?.(task.id)}
                        className="text-primary hover:text-primary/80 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <span className="flex-1 text-sm text-white/40 truncate line-through">
                        {task.title}
                      </span>
                      <button
                        onClick={() => onRemoveFromProject(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 cursor-pointer transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

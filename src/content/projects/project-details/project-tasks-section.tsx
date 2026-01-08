import { useState } from "react";
import { Plus, X, Circle, CheckCircle2 } from "lucide-react";
import { Task } from "@/types/task.types";

interface ProjectTasksSectionProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onRemoveFromProject: (taskId: string) => void;
}

export function ProjectTasksSection({
  tasks,
  onAddTask,
  onRemoveFromProject
}: ProjectTasksSectionProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim());
      setNewTaskTitle("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTaskTitle("");
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/60">
          Tarefas ({tasks.length})
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>

      {isAdding && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded-lg border border-white/10">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova tarefa..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
            autoFocus
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="text-primary hover:text-primary/80 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTaskTitle("");
            }}
            className="text-white/40 hover:text-white/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-1 max-h-[300px] overflow-y-auto scrollbar-none">
        {tasks.length === 0 ? (
          <div className="text-center text-white/40 py-4 text-sm">
            Nenhuma tarefa neste projeto
          </div>
        ) : (
          <>
            {incompleteTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5"
              >
                <Circle className="w-4 h-4 text-white/40" />
                <span className="flex-1 text-sm text-white/80 truncate">
                  {task.title}
                </span>
                <button
                  onClick={() => onRemoveFromProject(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 cursor-pointer"
                  title="Remover do projeto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {completedTasks.length > 0 && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <span className="text-xs text-white/40 px-2">
                  Concluídas ({completedTasks.length})
                </span>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="flex-1 text-sm text-white/60 truncate line-through">
                      {task.title}
                    </span>
                    <button
                      onClick={() => onRemoveFromProject(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 cursor-pointer"
                      title="Remover do projeto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

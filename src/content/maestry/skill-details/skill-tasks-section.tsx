import { Circle, CheckCircle2, ListTodo, X } from "lucide-react";
import { Task } from "@/types/task.types";

interface SkillTasksSectionProps {
  tasks: Task[];
  onRemoveSkillFromTask: (taskId: string) => void;
}

export function SkillTasksSection({
  tasks,
  onRemoveSkillFromTask
}: SkillTasksSectionProps) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="mt-4 border-t border-white/10 pt-4 px-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/50">
          <ListTodo className="w-4 h-4" />
          <span className="text-sm">Task History</span>
          {tasks.length > 0 && (
            <span className="text-xs text-white/30">({tasks.length})</span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="max-h-[250px] overflow-y-auto scrollbar-none space-y-1">
          {tasks.length === 0 ? (
            <div className="text-center text-white/30 py-4 text-sm">
              No tasks linked to this skill yet
            </div>
          ) : (
            <>
              {incompleteTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5"
                >
                  <Circle className="w-4 h-4 text-white/40 shrink-0" />
                  <span className="flex-1 text-sm text-white/70 truncate">
                    {task.title}
                  </span>
                  {task.completedPomodoros > 0 && (
                    <span className="text-xs text-white/30">
                      🍅 {task.completedPomodoros}
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveSkillFromTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 cursor-pointer transition-all"
                    title="Remove skill from task"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {completedTasks.length > 0 && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <span className="text-xs text-white/30 px-2">
                    Completed ({completedTasks.length})
                  </span>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="flex-1 text-sm text-white/40 truncate line-through">
                        {task.title}
                      </span>
                      {task.completedPomodoros > 0 && (
                        <span className="text-xs text-white/30">
                          🍅 {task.completedPomodoros}
                        </span>
                      )}
                      <button
                        onClick={() => onRemoveSkillFromTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 cursor-pointer transition-all"
                        title="Remove skill from task"
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

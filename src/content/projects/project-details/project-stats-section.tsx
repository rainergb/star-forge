import { ListTodo, Clock, Timer } from "lucide-react";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { Task } from "@/types/task.types";
import { cn } from "@/lib/utils";

interface ProjectStatsSectionProps {
  project: Project;
  tasks: Task[];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "0m";
}

export function ProjectStatsSection({
  project,
  tasks
}: ProjectStatsSectionProps) {
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalPomodoros = tasks.reduce(
    (acc, t) => acc + (t.estimatedPomodoros || 0),
    0
  );
  const completedPomodoros = tasks.reduce(
    (acc, t) => acc + (t.completedPomodoros || 0),
    0
  );

  const totalTimeSpent = tasks.reduce(
    (acc, t) => acc + (t.totalTimeSpent || 0),
    0
  );

  const colors = PROJECT_COLORS[project.color];

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center gap-2 text-white/50 px-2 mb-3">
        <ListTodo className="w-4 h-4" />
        <span className="text-sm">Progress</span>
      </div>

      <div className="space-y-3 px-2">
        <div>
          <div className="flex items-center justify-between text-xs text-white/40 mb-1">
            <span>Completed tasks</span>
            <span>
              {completedTasks}/{totalTasks}
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", colors.bg)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60">
            <Timer className="w-4 h-4" />
            <span className="text-sm">Pomodoros</span>
          </div>
          <span className="text-sm text-white/90 font-medium">
            {completedPomodoros}/{totalPomodoros || "-"}
          </span>
        </div>

        {totalTimeSpent > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Time spent</span>
            </div>
            <span className="text-sm text-white/90 font-medium">
              {formatTime(totalTimeSpent)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

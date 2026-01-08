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

export function ProjectStatsSection({ project, tasks }: ProjectStatsSectionProps) {
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
    <div className="p-4 border-b border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-3">Progresso</h3>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-white/40 mb-1">
          <span>Tarefas concluídas</span>
          <span>
            {completedTasks}/{totalTasks}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", colors.bg)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
          <ListTodo className="w-4 h-4 text-white/40 mb-1" />
          <span className="text-lg font-semibold text-white">
            {completedTasks}/{totalTasks}
          </span>
          <span className="text-xs text-white/40">Tarefas</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
          <Timer className="w-4 h-4 text-[#B57CFF] mb-1" />
          <span className="text-lg font-semibold text-white">
            {completedPomodoros}/{totalPomodoros || "-"}
          </span>
          <span className="text-xs text-white/40">Pomodoros</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
          <Clock className="w-4 h-4 text-[#1A7FFF] mb-1" />
          <span className="text-lg font-semibold text-white">
            {formatTime(totalTimeSpent)}
          </span>
          <span className="text-xs text-white/40">Tempo</span>
        </div>
      </div>
    </div>
  );
}

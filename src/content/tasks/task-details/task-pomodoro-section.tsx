import { Timer, Clock, Target, History, Plus, Minus } from "lucide-react";
import { Task } from "@/types/task.types";
import { PomodoroSession } from "@/types/pomodoro.types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface TaskPomodoroSectionProps {
  task: Task;
  sessions?: PomodoroSession[];
  onSetEstimatedPomodoros: (id: string, count: number | null) => void;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export function TaskPomodoroSection({
  task,
  sessions = [],
  onSetEstimatedPomodoros
}: TaskPomodoroSectionProps) {
  const handleIncrement = () => {
    const current = task.estimatedPomodoros ?? 0;
    if (current < 99) {
      onSetEstimatedPomodoros(task.id, current + 1);
    }
  };

  const handleDecrement = () => {
    const current = task.estimatedPomodoros ?? 0;
    if (current > 1) {
      onSetEstimatedPomodoros(task.id, current - 1);
    } else {
      onSetEstimatedPomodoros(task.id, null);
    }
  };

  const completedPomodoros = task.completedPomodoros ?? 0;
  const progress = task.estimatedPomodoros && task.estimatedPomodoros > 0
    ? Math.min((completedPomodoros / task.estimatedPomodoros) * 100, 100)
    : 0;

  return (
    <div className="mt-4 border-t border-white/10 pt-4 px-4 space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Timer className="w-4 h-4" />
        <span className="text-sm font-medium">Pomodoro</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60">
            <Target className="w-4 h-4" />
            <span className="text-sm">Estimated</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
              onClick={handleDecrement}
              disabled={!task.estimatedPomodoros}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center text-sm text-white/90 font-medium">
              {task.estimatedPomodoros ?? "-"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
              onClick={handleIncrement}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/60">
            <Timer className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <span className="text-sm text-white/90 font-medium">
            {completedPomodoros}
          </span>
        </div>

        {task.estimatedPomodoros && task.estimatedPomodoros > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/50">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {task.totalTimeSpent > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Time spent</span>
            </div>
            <span className="text-sm text-white/90 font-medium">
              {formatTime(task.totalTimeSpent)}
            </span>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-white/60">
              <History className="w-4 h-4" />
              <span className="text-sm">Recent Sessions</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-none">
              {sessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between text-xs py-1 px-2 bg-white/5 rounded"
                >
                  <span className="text-white/70">
                    {format(new Date(session.startedAt), "dd MMM, HH:mm")}
                  </span>
                  <span className="text-white/50">
                    {Math.round(session.duration / 60)}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

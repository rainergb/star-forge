import { CheckSquare, Clock, ListTodo, CalendarCheck } from "lucide-react";
import { Task } from "@/types/task.types";
import { StatsPeriod } from "@/types/pomodoro.types";
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear
} from "date-fns";

interface TasksStatsViewProps {
  tasks: Task[];
  period: StatsPeriod;
  projectId: string | null;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const getPeriodInterval = (period: StatsPeriod) => {
  const now = new Date();
  switch (period) {
    case "day":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "week":
      return { start: startOfWeek(now), end: endOfWeek(now) };
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "all":
    default:
      return null;
  }
};

export function TasksStatsView({ tasks, period, projectId }: TasksStatsViewProps) {
  const filteredByProject = projectId
    ? tasks.filter((t) => t.projectId === projectId)
    : tasks;

  const interval = getPeriodInterval(period);

  const filteredTasks = interval
    ? filteredByProject.filter((task) => {
        const createdDate = new Date(task.createdAt);
        return isWithinInterval(createdDate, interval);
      })
    : filteredByProject;

  const completedTasks = filteredTasks.filter((t) => t.completed);
  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const totalTimeSpent = filteredTasks.reduce((acc, t) => acc + (t.totalTimeSpent || 0), 0);
  const totalPomodoros = filteredTasks.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0);
  const totalSteps = filteredTasks.reduce((acc, t) => acc + (t.steps?.length || 0), 0);
  const completedSteps = filteredTasks.reduce(
    (acc, t) => acc + (t.steps?.filter((s) => s.completed).length || 0),
    0
  );

  const completionRate =
    filteredTasks.length > 0
      ? Math.round((completedTasks.length / filteredTasks.length) * 100)
      : 0;

  const stepsCompletionRate =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {completedTasks.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {completionRate}% completion rate
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <ListTodo className="w-4 h-4" />
            <span className="text-xs">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {pendingTasks.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {filteredTasks.length} total tasks
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Time Spent</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatDuration(totalTimeSpent)}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {totalPomodoros} pomodoros
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <CalendarCheck className="w-4 h-4" />
            <span className="text-xs">Steps</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {completedSteps}/{totalSteps}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {stepsCompletionRate}% completed
          </div>
        </div>
      </div>

      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white/70 mb-3">Task Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Tasks Completion</span>
              <span>{completionRate}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-white/50 mb-1">
              <span>Steps Completion</span>
              <span>{stepsCompletionRate}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${stepsCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

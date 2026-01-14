import { FolderKanban, Clock, CheckCircle, BarChart3 } from "lucide-react";
import { Project, PROJECT_COLORS, ProjectStats } from "@/types/project.types";
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

interface ProjectsStatsViewProps {
  projects: Project[];
  getProjectStats: (projectId: string) => ProjectStats;
  period: StatsPeriod;
  selectedProjectId: string | null;
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

function ProjectStatsCard({ project, stats }: { project: Project; stats: ProjectStats }) {
  return (
    <div className="bg-background/50 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: PROJECT_COLORS[project.color].solid }}
        />
        <span className="text-sm font-medium text-white truncate">{project.name}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-white/50">Tasks</span>
          <div className="text-white font-medium">
            {stats.completedTasks}/{stats.totalTasks}
          </div>
        </div>
        <div>
          <span className="text-white/50">Progress</span>
          <div className="text-white font-medium">
            {Math.round(stats.completionPercentage)}%
          </div>
        </div>
        <div>
          <span className="text-white/50">Time</span>
          <div className="text-white font-medium">
            {formatDuration(stats.totalTimeSpent)}
          </div>
        </div>
        <div>
          <span className="text-white/50">Pomodoros</span>
          <div className="text-white font-medium">
            {stats.completedPomodoros}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${stats.completionPercentage}%`,
              backgroundColor: PROJECT_COLORS[project.color].solid
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProjectsStatsView({
  projects,
  getProjectStats,
  period,
  selectedProjectId
}: ProjectsStatsViewProps) {
  const interval = getPeriodInterval(period);

  const filteredProjects = interval
    ? projects.filter((project) => {
        const createdDate = new Date(project.createdAt);
        return isWithinInterval(createdDate, interval) || project.status === "active";
      })
    : projects;

  const displayProjects = selectedProjectId
    ? filteredProjects.filter((p) => p.id === selectedProjectId)
    : filteredProjects;

  const activeProjects = displayProjects.filter((p) => p.status === "active");
  const completedProjects = displayProjects.filter((p) => p.status === "completed");

  const allStats = displayProjects.map((p) => getProjectStats(p.id));
  const totalTasks = allStats.reduce((acc, s) => acc + s.totalTasks, 0);
  const completedTasks = allStats.reduce((acc, s) => acc + s.completedTasks, 0);
  const totalTimeSpent = allStats.reduce((acc, s) => acc + s.totalTimeSpent, 0);
  const totalPomodoros = allStats.reduce((acc, s) => acc + s.completedPomodoros, 0);

  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (selectedProjectId) {
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return null;
    const stats = getProjectStats(selectedProjectId);

    return (
      <div className="space-y-4">
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${PROJECT_COLORS[project.color].solid}20` }}
            >
              <FolderKanban
                className="w-5 h-5"
                style={{ color: PROJECT_COLORS[project.color].solid }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{project.name}</h3>
              <span className="text-xs text-white/50 capitalize">{project.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Tasks</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.completedTasks}/{stats.totalTasks}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Progress</span>
              </div>
              <div className="text-xl font-bold text-white">
                {Math.round(stats.completionPercentage)}%
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Time</span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatDuration(stats.totalTimeSpent)}
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/60 mb-1">
                <FolderKanban className="w-4 h-4" />
                <span className="text-xs">Pomodoros</span>
              </div>
              <div className="text-xl font-bold text-white">
                {stats.completedPomodoros}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(stats.completionPercentage)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${stats.completionPercentage}%`,
                  backgroundColor: PROJECT_COLORS[project.color].solid
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {activeProjects.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {displayProjects.length} total projects
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {completedProjects.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {overallCompletion}% overall
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Total Time</span>
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
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {completedTasks}/{totalTasks}
          </div>
          <div className="text-xs text-white/40 mt-1">
            across all projects
          </div>
        </div>
      </div>

      {activeProjects.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/70">Active Projects</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto scrollbar-none">
            {activeProjects.slice(0, 4).map((project) => (
              <ProjectStatsCard
                key={project.id}
                project={project}
                stats={getProjectStats(project.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

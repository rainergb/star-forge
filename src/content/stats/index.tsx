import { useState, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useSkills } from "@/hooks/use-skills";
import { StatsPeriod, PomodoroSession } from "@/types/pomodoro.types";
import { Button } from "@/components/ui/button";
import {
  format,
  subDays,
  subMonths,
  subHours,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfHour,
  endOfHour,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from "date-fns";

import {
  StatsViewSelector,
  StatsView,
  VIEW_ORDER,
  getViewIndex
} from "./stats-view-selector";
import { ProjectFilter } from "./project-filter";
import { GeneralStatsView } from "./general-stats-view";
import { StatsCards } from "./stats-cards";
import { CycleStarsAquarium } from "./cycle-stars-aquarium";
import { StatsChart } from "./stats-chart";
import { RecentSessions } from "./recent-sessions";
import { TasksStatsView } from "./tasks-stats-view";
import { ProjectsStatsView } from "./projects-stats-view";
import { MaestryStatsView } from "./maestry-stats-view";

const periodLabels: Record<StatsPeriod, string> = {
  day: "Today",
  week: "Week",
  month: "Month",
  year: "Year",
  all: "All"
};

export function PomodoroStats() {
  const { sessions, getStats } = usePomodoroSessions();
  const { tasks, getTask } = useTasks();
  const { projects, getProjectStats } = useProjects();
  const { skills, getSkillStats } = useSkills();

  const [currentView, setCurrentView] = useState<StatsView>("general");
  const [period, setPeriod] = useState<StatsPeriod>("week");
  const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filterSessionsByProject = (
    sessionsToFilter: PomodoroSession[]
  ): PomodoroSession[] => {
    if (!filterProjectId) return sessionsToFilter;
    return sessionsToFilter.filter((session) => {
      if (!session.taskId) return false;
      const task = getTask(session.taskId);
      return task?.projectId === filterProjectId;
    });
  };

  const filteredSessions = filterSessionsByProject(sessions);
  const stats = getStats(period, filteredSessions);
  const cycleStars = stats.completedCycles;
  const activeProjects = projects.filter((p) => p.status === "active");

  const getChartData = () => {
    switch (period) {
      case "day": {
        const data = [];
        for (let i = 23; i >= 0; i--) {
          const hour = subHours(new Date(), i);
          const start = startOfHour(hour);
          const end = endOfHour(hour);

          const hourSessions = filteredSessions.filter(
            (s) =>
              s.completed &&
              s.mode === "work" &&
              isWithinInterval(new Date(s.startedAt), { start, end })
          );

          const totalMinutes = Math.round(
            hourSessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          data.push({
            label: format(hour, "HH"),
            value: totalMinutes,
            sessions: hourSessions.length
          });
        }
        return data.filter((_, i) => i % 2 === 0);
      }

      case "week": {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const start = startOfDay(date);
          const end = endOfDay(date);

          const daySessions = filteredSessions.filter(
            (s) =>
              s.completed &&
              s.mode === "work" &&
              isWithinInterval(new Date(s.startedAt), { start, end })
          );

          const totalMinutes = Math.round(
            daySessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          data.push({
            label: format(date, "EEE"),
            value: totalMinutes,
            sessions: daySessions.length
          });
        }
        return data;
      }

      case "month": {
        const data = [];
        for (let i = 3; i >= 0; i--) {
          const weekStart = startOfWeek(subDays(new Date(), i * 7));
          const weekEnd = endOfWeek(subDays(new Date(), i * 7));

          const weekSessions = filteredSessions.filter(
            (s) =>
              s.completed &&
              s.mode === "work" &&
              isWithinInterval(new Date(s.startedAt), {
                start: weekStart,
                end: weekEnd
              })
          );

          const totalMinutes = Math.round(
            weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          data.push({
            label: `S${4 - i}`,
            value: totalMinutes,
            sessions: weekSessions.length
          });
        }
        return data;
      }

      case "year":
      case "all": {
        const data = [];
        for (let i = 11; i >= 0; i--) {
          const month = subMonths(new Date(), i);
          const start = startOfMonth(month);
          const end = endOfMonth(month);

          const monthSessions = filteredSessions.filter(
            (s) =>
              s.completed &&
              s.mode === "work" &&
              isWithinInterval(new Date(s.startedAt), { start, end })
          );

          const totalMinutes = Math.round(
            monthSessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          data.push({
            label: format(month, "MMM"),
            value: totalMinutes,
            sessions: monthSessions.length
          });
        }
        return data;
      }

      default:
        return [];
    }
  };

  const chartData = getChartData();
  const currentIndex = getViewIndex(currentView);

  const renderPomodoroView = () => (
    <div className="space-y-4">
      <ProjectFilter
        projects={activeProjects}
        selectedProjectId={filterProjectId}
        onSelectProject={setFilterProjectId}
      />

      <StatsCards
        completedSessions={stats.completedSessions}
        totalWorkTime={stats.totalWorkTime}
        completedCycles={stats.completedCycles}
      />

      <CycleStarsAquarium cycleStars={cycleStars} />

      <StatsChart period={period} chartData={chartData} />

      <RecentSessions sessions={filteredSessions} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto h-full">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-semibold text-white/90 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Statistics
        </h2>

        <div className="flex gap-1">
          {(["day", "week", "month", "all"] as StatsPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={period === p ? "bg-primary/80" : "text-white/60"}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      <StatsViewSelector
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex-1 overflow-hidden" ref={containerRef}>
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {VIEW_ORDER.map((view) => (
            <div
              key={view}
              className="w-full shrink-0 h-full overflow-y-auto scrollbar-none px-0.5"
            >
              {view === "general" && (
                <GeneralStatsView
                  sessions={filteredSessions}
                  tasks={tasks}
                  projects={projects}
                  skills={skills}
                  totalWorkTime={stats.totalWorkTime}
                  completedCycles={stats.completedCycles}
                />
              )}
              {view === "pomodoro" && renderPomodoroView()}
              {view === "tasks" && (
                <TasksStatsView
                  tasks={tasks}
                  period={period}
                  projectId={filterProjectId}
                />
              )}
              {view === "projects" && (
                <div className="space-y-4">
                  <ProjectFilter
                    projects={activeProjects}
                    selectedProjectId={filterProjectId}
                    onSelectProject={setFilterProjectId}
                  />
                  <ProjectsStatsView
                    projects={projects}
                    getProjectStats={getProjectStats}
                    period={period}
                    selectedProjectId={filterProjectId}
                  />
                </div>
              )}
              {view === "maestry" && (
                <MaestryStatsView
                  skills={skills}
                  getSkillStats={getSkillStats}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

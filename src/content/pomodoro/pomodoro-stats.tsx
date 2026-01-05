import { useState } from "react";
import {
  Timer,
  Clock,
  TrendingUp,
  Calendar,
  Flame
} from "lucide-react";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { StatsPeriod } from "@/types/pomodoro.types";
import { Button } from "@/components/ui/button";
import { format, subDays, subMonths, subHours, isWithinInterval, startOfDay, endOfDay, startOfHour, endOfHour, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const periodLabels: Record<StatsPeriod, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All Time"
};

const chartLabels: Record<StatsPeriod, string> = {
  day: "Today (by hour)",
  week: "Last 7 Days",
  month: "Last 4 Weeks",
  year: "Last 12 Months",
  all: "All Time"
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export function PomodoroStats() {
  const { sessions, getStats } = usePomodoroSessions();
  const [period, setPeriod] = useState<StatsPeriod>("week");

  const stats = getStats(period);

  const getChartData = () => {
    switch (period) {
      case "day": {
        const data = [];
        for (let i = 23; i >= 0; i--) {
          const hour = subHours(new Date(), i);
          const start = startOfHour(hour);
          const end = endOfHour(hour);

          const hourSessions = sessions.filter(
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

          const daySessions = sessions.filter(
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

          const weekSessions = sessions.filter(
            (s) =>
              s.completed &&
              s.mode === "work" &&
              isWithinInterval(new Date(s.startedAt), { start: weekStart, end: weekEnd })
          );

          const totalMinutes = Math.round(
            weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60
          );

          data.push({
            label: `W${4 - i}`,
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

          const monthSessions = sessions.filter(
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
  const maxMinutes = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Timer className="w-4 h-4" />
            <span className="text-xs">Pomodoros</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.completedSessions}
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Focus Time</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {formatDuration(stats.totalWorkTime)}
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs">Cycles</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.completedCycles}
          </div>
        </div>
      </div>

      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white/60 mb-4">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{chartLabels[period]}</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {chartData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end h-24">
                <div
                  className="w-full bg-primary/60 rounded-t transition-all duration-300 min-h-1"
                  style={{
                    height: `${(item.value / maxMinutes) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs text-white/50">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs text-white/50">
          <span>Total: {formatDuration(chartData.reduce((a, d) => a + d.value * 60, 0))}</span>
          <span>Sessions: {chartData.reduce((a, d) => a + d.sessions, 0)}</span>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <Timer className="w-4 h-4" />
            <span className="text-sm">Recent Sessions</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sessions
              .filter((s) => s.completed && s.mode === "work")
              .slice(0, 10)
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 px-3 bg-white/5 rounded"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-white/80">
                      {session.taskTitle || "No task"}
                    </span>
                    <span className="text-xs text-white/40">
                      {format(new Date(session.startedAt), "MMM d, HH:mm")}
                    </span>
                  </div>
                  <span className="text-sm text-white/60">
                    {Math.round(session.duration / 60)}m
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

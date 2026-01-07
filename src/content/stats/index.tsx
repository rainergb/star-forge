import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { StatsPeriod } from "@/types/pomodoro.types";
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

import { StatsCards } from "./stats-cards";
import { CycleStarsAquarium } from "./cycle-stars-aquarium";
import { StatsChart } from "./stats-chart";
import { RecentSessions } from "./recent-sessions";

const periodLabels: Record<StatsPeriod, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All Time"
};

export function PomodoroStats() {
  const { sessions, getStats } = usePomodoroSessions();
  const [period, setPeriod] = useState<StatsPeriod>("week");

  const stats = getStats(period);
  const cycleStars = stats.completedCycles;

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
              isWithinInterval(new Date(s.startedAt), {
                start: weekStart,
                end: weekEnd
              })
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

      <StatsCards
        completedSessions={stats.completedSessions}
        totalWorkTime={stats.totalWorkTime}
        completedCycles={stats.completedCycles}
      />

      <CycleStarsAquarium cycleStars={cycleStars} />

      <StatsChart period={period} chartData={chartData} />

      <RecentSessions sessions={sessions} />
    </div>
  );
}

import { useState } from "react";
import { Timer, Clock, TrendingUp, Calendar, Flame, Star } from "lucide-react";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useConfig } from "@/hooks/use-config";
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

interface MiniCycleStarProps {
  index: number;
}

function MiniCycleStar({ index }: MiniCycleStarProps) {
  const positions = [
    { x: 20, y: 30 },
    { x: 70, y: 25 },
    { x: 45, y: 60 },
    { x: 15, y: 70 },
    { x: 80, y: 65 },
    { x: 35, y: 20 },
    { x: 60, y: 75 },
    { x: 25, y: 50 },
    { x: 75, y: 45 },
    { x: 50, y: 35 },
    { x: 10, y: 40 },
    { x: 85, y: 30 },
    { x: 40, y: 80 },
    { x: 65, y: 15 },
    { x: 30, y: 85 },
  ];

  const pos = positions[index % positions.length];
  const animationDelay = (index * 0.3) % 3;
  const floatDuration = 3 + (index % 3);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        animation: `float ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-6 h-6 bg-primary/30 rounded-full blur-lg" />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,1)] z-20" />
        <div className="absolute w-4 h-px bg-linear-to-r from-transparent via-white to-transparent opacity-80" />
        <div className="absolute w-px h-4 bg-linear-to-b from-transparent via-white to-transparent opacity-80" />
        <div className="absolute w-2 h-px bg-linear-to-r from-transparent via-white/50 to-transparent rotate-45" />
        <div className="absolute w-px h-2 bg-linear-to-b from-transparent via-white/50 to-transparent rotate-45" />
        <div className="absolute w-2 h-2 bg-primary/40 rounded-full blur-sm" />
      </div>
    </div>
  );
}

interface ChartBarProps {
  item: { label: string; value: number; sessions: number };
  maxMinutes: number;
}

function ChartBar({ item, maxMinutes }: ChartBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex-1 flex flex-col items-center gap-2 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1d3a] border border-white/20 rounded-lg px-3 py-2 shadow-xl z-10 whitespace-nowrap">
          <div className="text-xs text-white/90 font-medium">{item.label}</div>
          <div className="text-xs text-white/60 mt-1">
            <span className="text-primary">{item.value}m</span> •{" "}
            {item.sessions} sessions
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-[#1a1d3a] border-r border-b border-white/20 transform rotate-45" />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col items-center justify-end h-24 cursor-pointer">
        <div
          className="w-full bg-primary/60 hover:bg-primary/80 rounded-t transition-all duration-300 min-h-1"
          style={{
            height: `${(item.value / maxMinutes) * 100}%`
          }}
        />
      </div>
      <span className="text-xs text-white/50">{item.label}</span>
    </div>
  );
}

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
  const { settings } = useConfig();
  const [period, setPeriod] = useState<StatsPeriod>("week");

  const stats = getStats(period);
  const longBreakInterval = settings.longBreakInterval || 4;
  const cycleStars = Math.floor(stats.completedCycles / longBreakInterval);

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

      <div className="grid grid-cols-4 gap-4">
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

        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Star className="w-4 h-4" />
            <span className="text-xs">Cycle Stars</span>
          </div>
          <div className="text-2xl font-bold text-white">{cycleStars}</div>
        </div>
      </div>

      {cycleStars > 0 && (
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/60">
              <Star className="w-4 h-4" />
              <span className="text-sm">Cycle Stars Collected</span>
            </div>
            <span className="text-sm text-white/50">{cycleStars} stars</span>
          </div>
          <div 
            className="relative h-24 rounded-lg overflow-hidden"
            style={{
              background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, rgba(15, 15, 30, 0.8) 70%)"
            }}
          >
            <div className="absolute inset-0 bg-linear-to-t from-primary/5 to-transparent" />
            {Array.from({ length: Math.min(cycleStars, 15) }).map((_, i) => (
              <MiniCycleStar key={i} index={i} />
            ))}
            {cycleStars > 15 && (
              <div className="absolute bottom-2 right-2 text-xs text-white/40">
                +{cycleStars - 15} more
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white/60 mb-4">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{chartLabels[period]}</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {chartData.map((item, i) => (
            <ChartBar key={i} item={item} maxMinutes={maxMinutes} />
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs text-white/50">
          <span>
            Total:{" "}
            {formatDuration(chartData.reduce((a, d) => a + d.value * 60, 0))}
          </span>
          <span>Sessions: {chartData.reduce((a, d) => a + d.sessions, 0)}</span>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-4">
            <Timer className="w-4 h-4" />
            <span className="text-sm">Recent Sessions</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none">
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

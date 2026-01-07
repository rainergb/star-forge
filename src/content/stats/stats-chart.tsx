import { Calendar } from "lucide-react";
import { ChartBar } from "./chart-bar";
import { StatsPeriod } from "@/types/pomodoro.types";

interface ChartDataItem {
  label: string;
  value: number;
  sessions: number;
}

interface StatsChartProps {
  period: StatsPeriod;
  chartData: ChartDataItem[];
}

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

export function StatsChart({ period, chartData }: StatsChartProps) {
  const maxMinutes = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div className="bg-background/50 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-white/60 mb-4">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{chartLabels[period]}</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-24">
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
  );
}

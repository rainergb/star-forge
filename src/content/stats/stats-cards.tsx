import { Timer, Clock, Flame } from "lucide-react";

interface StatsCardsProps {
  completedSessions: number;
  totalWorkTime: number;
  completedCycles: number;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export function StatsCards({ completedSessions, totalWorkTime, completedCycles }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white/60 mb-2">
          <Timer className="w-4 h-4" />
          <span className="text-xs">Pomodoros</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {completedSessions}
        </div>
      </div>

      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white/60 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Focus Time</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {formatDuration(totalWorkTime)}
        </div>
      </div>

      <div className="bg-background/50 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-2 text-white/60 mb-2">
          <Flame className="w-4 h-4" />
          <span className="text-xs">Cycles</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {completedCycles}
        </div>
      </div>
    </div>
  );
}

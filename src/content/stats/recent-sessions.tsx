import { Timer } from "lucide-react";
import { format } from "date-fns";
import { PomodoroSession } from "@/types/pomodoro.types";

interface RecentSessionsProps {
  sessions: PomodoroSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const recentSessions = sessions
    .filter((s) => s.completed && s.mode === "work")
    .slice(0, 10);

  if (recentSessions.length === 0) return null;

  return (
    <div className="bg-background/50 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-2 text-white/60 mb-4">
        <Timer className="w-4 h-4" />
        <span className="text-sm">Recent Sessions</span>
      </div>

      <div className="space-y-2 max-h-[95px] overflow-y-auto scrollbar-none">
        {recentSessions.map((session) => (
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
  );
}

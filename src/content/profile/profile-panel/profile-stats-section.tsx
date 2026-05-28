import { CheckSquare, Timer, Swords, BookOpen, Clock } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { usePomodoroSessions } from "@/hooks/use-pomodoro-sessions";
import { useSkills } from "@/hooks/use-skills";
import { useDiary } from "@/hooks/use-diary";
import { DetailSection } from "@/components/shared/detail-item";
import { CycleStarsAquarium } from "@/content/stats/cycle-stars-aquarium";

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export function ProfileStatsSection() {
  const { tasks } = useTasks();
  const { getStats } = usePomodoroSessions();
  const { skills } = useSkills();
  const { entries } = useDiary();

  const allTime = getStats("all");
  const completedTasks = tasks.filter((t) => t.completed).length;

  return (
    <DetailSection>
      <div className="space-y-1.5">
        {/* Row 1: Pomodoros + Focus Time */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-background/50 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-white/60 mb-1">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-xs">Pomodoros</span>
            </div>
            <div className="text-xl font-bold text-white">{allTime.completedSessions}</div>
            <div className="text-xs text-white/40">{allTime.completedCycles} cycles</div>
          </div>

          <div className="bg-background/50 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-white/60 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Focus Time</span>
            </div>
            <div className="text-xl font-bold text-white">{formatDuration(allTime.totalWorkTime)}</div>
            <div className="text-xs text-white/40">total focused</div>
          </div>
        </div>

        {/* Row 2: Tasks + Skills */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-background/50 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-white/60 mb-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span className="text-xs">Tasks</span>
            </div>
            <div className="text-xl font-bold text-white">{completedTasks}</div>
            <div className="text-xs text-white/40">{tasks.length - completedTasks} pending</div>
          </div>

          <div className="bg-background/50 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-white/60 mb-1">
              <Swords className="w-3.5 h-3.5" />
              <span className="text-xs">Skills</span>
            </div>
            <div className="text-xl font-bold text-white">{skills.length}</div>
            <div className="text-xs text-white/40">
              <BookOpen className="w-3 h-3 inline mr-0.5 opacity-60" />
              {entries.length} diary entries
            </div>
          </div>
        </div>

        {/* Cycle Stars Aquarium */}
        <CycleStarsAquarium cycleStars={allTime.completedCycles} />
      </div>
    </DetailSection>
  );
}

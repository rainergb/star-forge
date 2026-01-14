import { Clock, Target, CheckCircle, Zap } from "lucide-react";
import { Skill, SkillStats } from "@/types/skill.types";
import { MasteryProgress } from "../mastery-progress";

interface SkillStatsSectionProps {
  skill: Skill;
  stats: SkillStats | null;
}

export function SkillStatsSection({ skill, stats }: SkillStatsSectionProps) {
  const totalHours = skill.totalTimeSpent / 3600;

  return (
    <div className="p-4 space-y-6">
      <MasteryProgress skill={skill} showDetails />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 text-white/50 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Total Time</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {totalHours.toFixed(1)}h
          </p>
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 text-white/50 mb-1">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Pomodoros</span>
          </div>
          <p className="text-lg font-semibold text-white">
            {skill.totalPomodoros}
          </p>
        </div>

        {stats && (
          <>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">Total Tasks</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {stats.totalTasks}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white/50 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Active Tasks</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {stats.activeTasks}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

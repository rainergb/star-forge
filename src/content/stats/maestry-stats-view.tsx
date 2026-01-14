import { Sparkles, Clock, Award } from "lucide-react";
import { Skill, SKILL_COLORS, SkillStats, MASTERY_LEVELS, MasteryLevel } from "@/types/skill.types";

import maestry1 from "@/assets/maestry/maestry1.png";
import maestry2 from "@/assets/maestry/maestry2.png";
import maestry3 from "@/assets/maestry/maestry3.png";
import maestry4 from "@/assets/maestry/maestry4.png";
import maestry5 from "@/assets/maestry/maestry5.png";
import maestry6 from "@/assets/maestry/maestry6.png";
import maestry7 from "@/assets/maestry/maestry7.png";

const MASTERY_IMAGES: Record<MasteryLevel, string> = {
  1: maestry1,
  2: maestry2,
  3: maestry3,
  4: maestry4,
  5: maestry5,
  6: maestry6,
  7: maestry7
};

interface MaestryStatsViewProps {
  skills: Skill[];
  getSkillStats: (id: string) => SkillStats | null;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

function SkillStatsCard({ skill, stats }: { skill: Skill; stats: SkillStats | null }) {
  if (!stats) return null;

  const levelInfo = MASTERY_LEVELS[skill.currentLevel - 1];

  return (
    <div className="bg-background/50 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={MASTERY_IMAGES[skill.currentLevel]}
          alt={`Level ${skill.currentLevel}`}
          className="w-10 h-10 object-contain"
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-white truncate block">
            {skill.name}
          </span>
          <span className="text-xs text-white/50">{levelInfo.name}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded text-xs font-medium"
          style={{
            backgroundColor: `${SKILL_COLORS[skill.color].solid}20`,
            color: SKILL_COLORS[skill.color].solid
          }}
        >
          Lv.{skill.currentLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <span className="text-white/50">Total Hours</span>
          <div className="text-white font-medium">
            {stats.totalHours.toFixed(1)}h
          </div>
        </div>
        <div>
          <span className="text-white/50">Pomodoros</span>
          <div className="text-white font-medium">{stats.totalPomodoros}</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-white/50 mb-1">
          <span>Next Level</span>
          <span>{Math.round(stats.progressPercentage)}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(100, stats.progressPercentage)}%`,
              backgroundColor: SKILL_COLORS[skill.color].solid
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function MaestryStatsView({ skills, getSkillStats }: MaestryStatsViewProps) {
  const activeSkills = skills.filter((s) => !s.archived);

  const totalTimeSpent = activeSkills.reduce((acc, s) => acc + s.totalTimeSpent, 0);
  const totalPomodoros = activeSkills.reduce((acc, s) => acc + s.totalPomodoros, 0);
  const avgLevel =
    activeSkills.length > 0
      ? activeSkills.reduce((acc, s) => acc + s.currentLevel, 0) / activeSkills.length
      : 0;

  const highestLevelSkill = activeSkills.reduce(
    (highest, skill) =>
      !highest || skill.currentLevel > highest.currentLevel ? skill : highest,
    null as Skill | null
  );

  const levelDistribution = activeSkills.reduce(
    (acc, skill) => {
      acc[skill.currentLevel] = (acc[skill.currentLevel] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/50 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs">Active Skills</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {activeSkills.length}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Avg. Lv.{avgLevel.toFixed(1)}
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

        {highestLevelSkill && (
          <div className="col-span-2 bg-background/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-xs">Highest Level Skill</span>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={MASTERY_IMAGES[highestLevelSkill.currentLevel]}
                alt={`Level ${highestLevelSkill.currentLevel}`}
                className="w-12 h-12 object-contain"
              />
              <div>
                <div className="text-lg font-bold text-white">
                  {highestLevelSkill.name}
                </div>
                <div className="text-xs text-white/50">
                  {MASTERY_LEVELS[highestLevelSkill.currentLevel - 1].name} - Level{" "}
                  {highestLevelSkill.currentLevel}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {activeSkills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/70">Level Distribution</h3>
          <div className="bg-background/50 border border-white/10 rounded-lg p-4">
            <div className="flex items-end gap-2 h-20">
              {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                const count = levelDistribution[level] || 0;
                const maxCount = Math.max(...Object.values(levelDistribution), 1);
                const height = count > 0 ? (count / maxCount) * 100 : 5;

                return (
                  <div key={level} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/50 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                    <img
                      src={MASTERY_IMAGES[level as MasteryLevel]}
                      alt={`Level ${level}`}
                      className="w-6 h-6 object-contain opacity-60"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSkills.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-white/70">Skills Progress</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto scrollbar-none">
            {activeSkills.slice(0, 4).map((skill) => (
              <SkillStatsCard
                key={skill.id}
                skill={skill}
                stats={getSkillStats(skill.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

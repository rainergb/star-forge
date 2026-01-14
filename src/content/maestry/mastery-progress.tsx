import {
  Skill,
  SKILL_COLORS,
  MASTERY_LEVELS,
  getProgressToNextLevel
} from "@/types/skill.types";
import { cn } from "@/lib/utils";

interface MasteryProgressProps {
  skill: Skill;
  showDetails?: boolean;
  className?: string;
}

export function MasteryProgress({
  skill,
  showDetails = true,
  className
}: MasteryProgressProps) {
  const progress = getProgressToNextLevel(skill.totalTimeSpent);
  const totalHours = skill.totalTimeSpent / 3600;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        {MASTERY_LEVELS.map((level) => (
          <div
            key={level.level}
            className={cn(
              "flex-1 flex flex-col items-center gap-1",
              level.level <= skill.currentLevel
                ? "opacity-100"
                : "opacity-30"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                level.level === skill.currentLevel && "ring-2 ring-offset-2 ring-offset-background"
              )}
              style={{
                backgroundColor:
                  level.level <= skill.currentLevel
                    ? SKILL_COLORS[skill.color].solid
                    : "rgba(255,255,255,0.1)",
                color:
                  level.level <= skill.currentLevel
                    ? "white"
                    : "rgba(255,255,255,0.3)",
                ["--tw-ring-color" as string]:
                  level.level === skill.currentLevel
                    ? SKILL_COLORS[skill.color].solid
                    : "transparent"
              }}
            >
              {level.level}
            </div>
            <span className="text-[10px] text-white/50 text-center hidden sm:block">
              {level.name}
            </span>
          </div>
        ))}
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              {MASTERY_LEVELS[skill.currentLevel - 1].name}
            </span>
            <span className="text-white/50">
              {Math.round(progress.progressPercentage)}%
            </span>
          </div>

          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, progress.progressPercentage)}%`,
                backgroundColor: SKILL_COLORS[skill.color].solid
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{totalHours.toFixed(1)}h invested</span>
            {skill.currentLevel < 7 && (
              <span>{Math.ceil(progress.hoursToNextLevel)}h to next level</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

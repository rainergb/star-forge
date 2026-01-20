import {
  Timer,
  CheckSquare,
  FolderKanban,
  Sparkles,
  Clock,
  TrendingUp
} from "lucide-react";
import { PomodoroSession } from "@/types/pomodoro.types";
import { Task } from "@/types/task.types";
import { Project, PROJECT_COLORS } from "@/types/project.types";
import { Skill, MasteryLevel } from "@/types/skill.types";

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

interface GeneralStatsViewProps {
  sessions: PomodoroSession[];
  tasks: Task[];
  projects: Project[];
  skills: Skill[];
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

export function GeneralStatsView({
  sessions,
  tasks,
  projects,
  skills,
  totalWorkTime,
  completedCycles
}: GeneralStatsViewProps) {
  const completedSessions = sessions.filter((s) => s.completed && s.mode === "work").length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const topProject = projects
    .filter((p) => p.status === "active")
    .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)[0];

  const topSkill = skills
    .sort((a, b) => b.currentLevel - a.currentLevel || b.totalTimeSpent - a.totalTimeSpent)[0];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1">
        <div className="bg-background/50 border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-white/60 mb-0.5">
            <Timer className="w-4 h-4" />
            <span className="text-xs">Pomodoros</span>
          </div>
          <div className="text-xl font-bold text-white">{completedSessions}</div>
          <div className="text-xs text-white/40">{completedCycles} cycles</div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-white/60 mb-0.5">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Focus Time</span>
          </div>
          <div className="text-xl font-bold text-white">
            {formatDuration(totalWorkTime)}
          </div>
          <div className="text-xs text-white/40">total focused</div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-white/60 mb-0.5">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs">Tasks</span>
          </div>
          <div className="text-xl font-bold text-white">{completedTasks}</div>
          <div className="text-xs text-white/40">
            {tasks.length - completedTasks} pending
          </div>
        </div>

        <div className="bg-background/50 border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-1 text-white/60 mb-0.5">
            <FolderKanban className="w-4 h-4" />
            <span className="text-xs">Projects</span>
          </div>
          <div className="text-xl font-bold text-white">{activeProjects}</div>
          <div className="text-xs text-white/40">{projects.length} total</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1">
        {topProject && (
          <div className="bg-background/50 border border-white/10 rounded-lg p-2">
            <div className="flex items-center gap-1 text-white/60 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Top Project</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PROJECT_COLORS[topProject.color].solid }}
              />
              <span className="text-sm font-medium text-white truncate">
                {topProject.name}
              </span>
            </div>
            <div className="text-xs text-white/40 mt-1">
              {formatDuration(topProject.totalTimeSpent)}
            </div>
          </div>
        )}

        {topSkill && (
          <div className="bg-background/50 border border-white/10 rounded-lg p-2">
            <div className="flex items-center gap-1 text-white/60 mb-0.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Top Skill</span>
            </div>
            <div className="flex items-center gap-1">
              <img
                src={MASTERY_IMAGES[topSkill.currentLevel]}
                alt={`Level ${topSkill.currentLevel}`}
                className="w-6 h-6 object-contain"
              />
              <span className="text-sm font-medium text-white truncate">
                {topSkill.name}
              </span>
            </div>
            <div className="text-xs text-white/40">
              Level {topSkill.currentLevel}
            </div>
          </div>
        )}
      </div>

      <div className="bg-background/50 border border-white/10 rounded-lg p-3">
        <h3 className="text-sm font-medium text-white/70 mb-1">Overview</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/70">Pomodoros</span>
            </div>
            <span className="text-sm font-medium text-white">{completedSessions}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CheckSquare className="w-4 h-4 text-green-400" />
              <span className="text-sm text-white/70">Tasks Completed</span>
            </div>
            <span className="text-sm font-medium text-white">{completedTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/70">Active Projects</span>
            </div>
            <span className="text-sm font-medium text-white">{activeProjects}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/70">Skills Tracked</span>
            </div>
            <span className="text-sm font-medium text-white">{skills.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

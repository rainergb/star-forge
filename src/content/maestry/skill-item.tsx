import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Clock, Archive } from "lucide-react";
import {
  Skill,
  SKILL_COLORS,
  MASTERY_LEVELS,
  MasteryLevel,
  getProgressToNextLevel
} from "@/types/skill.types";
import { cn } from "@/lib/utils";

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

const formatTimeSpent = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  if (minutes > 0) return `${minutes}m`;
  return "0m";
};

interface SkillItemProps {
  skill: Skill;
  onClick: () => void;
  onDoubleClick?: () => void;
  onRemoveSkill: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
}

export function SkillItem({
  skill,
  onClick,
  onDoubleClick,
  onRemoveSkill,
  onToggleArchive
}: SkillItemProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null
  );

  const levelInfo = MASTERY_LEVELS[skill.currentLevel - 1];
  const progress = getProgressToNextLevel(skill.totalTimeSpent);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleArchive = () => {
    onToggleArchive(skill.id);
    closeContextMenu();
  };

  const handleDelete = () => {
    onRemoveSkill(skill.id);
    closeContextMenu();
  };

  return (
    <>
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        className={cn(
          "flex items-center justify-between px-4 py-3 bg-background/50 border rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
          "border-white/10",
          skill.archived && "opacity-50"
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={MASTERY_IMAGES[skill.currentLevel]}
            alt={`Level ${skill.currentLevel}`}
            className="w-10 h-10 object-contain shrink-0"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-white/90">{skill.name}</span>
              <span
                className="px-1.5 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${SKILL_COLORS[skill.color].solid}20`,
                  color: SKILL_COLORS[skill.color].solid
                }}
              >
                Lv.{skill.currentLevel}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/40">{levelInfo.name}</span>
              {skill.totalTimeSpent > 0 && (
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeSpent(skill.totalTimeSpent)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, progress.progressPercentage)}%`,
                backgroundColor: SKILL_COLORS[skill.color].solid
              }}
            />
          </div>
          <span className="text-xs text-white/40 w-8 text-right">
            {Math.round(progress.progressPercentage)}%
          </span>
        </div>
      </div>

      {contextMenu &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-100"
              onClick={closeContextMenu}
            />
            <div
              className="fixed z-101 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl py-1 min-w-40"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                onClick={handleArchive}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                {skill.archived ? "Unarchive" : "Archive"}
              </button>
              <div className="border-t border-white/10 my-1" />
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

import { Trash2, Clock } from "lucide-react";
import {
  Skill,
  SKILL_COLORS,
  MASTERY_LEVELS,
  MasteryLevel,
  getProgressToNextLevel
} from "@/types/skill.types";
import {
  ContextMenu,
  ContextMenuItem,
  useContextMenu
} from "@/components/shared/context-menu";
import {
  ListItem,
  ListItemTitle,
  ListItemMeta,
  ListItemBadge,
  ListItemStat,
  ListItemProgress
} from "@/components/shared/list-item";

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
}

export function SkillItem({
  skill,
  onClick,
  onDoubleClick,
  onRemoveSkill
}: SkillItemProps) {
  const { position: contextMenu, handleContextMenu, close: closeContextMenu } = useContextMenu();

  const levelInfo = MASTERY_LEVELS[skill.currentLevel - 1];
  const progress = getProgressToNextLevel(skill.totalTimeSpent);

  const handleDelete = () => {
    onRemoveSkill(skill.id);
    closeContextMenu();
  };

  return (
    <>
      <ListItem
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        coverImage={skill.image}
        leading={
          <img
            src={MASTERY_IMAGES[skill.currentLevel]}
            alt={`Level ${skill.currentLevel}`}
            className="w-10 h-10 object-contain shrink-0"
          />
        }
        trailing={
          <ListItemProgress
            value={progress.progressPercentage}
            color={SKILL_COLORS[skill.color].solid}
          />
        }
      >
        <div className="flex items-center gap-2">
          <ListItemTitle>{skill.name}</ListItemTitle>
          <ListItemBadge
            color={SKILL_COLORS[skill.color].solid}
            bgColor={`${SKILL_COLORS[skill.color].solid}20`}
          >
            Lv.{skill.currentLevel}
          </ListItemBadge>
        </div>

        <ListItemMeta>
          <span className="text-xs text-white/40">{levelInfo.name}</span>
          {skill.totalTimeSpent > 0 && (
            <ListItemStat icon={<Clock className="w-3 h-3" />} color="text-white/40">
              {formatTimeSpent(skill.totalTimeSpent)}
            </ListItemStat>
          )}
        </ListItemMeta>
      </ListItem>

      <ContextMenu position={contextMenu} onClose={closeContextMenu}>
        <ContextMenuItem
          icon={<Trash2 className="w-4 h-4" />}
          label="Delete"
          onClick={handleDelete}
          variant="danger"
        />
      </ContextMenu>
    </>
  );
}

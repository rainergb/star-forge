import { Zap } from "lucide-react";
import { Skill } from "@/types/skill.types";
import { SkillItem } from "./skill-item";
import {
  ListContainer,
  EmptyState
} from "@/components/shared/list-container";

interface SkillListContentProps {
  skills: Skill[];
  hasActiveFilter: boolean;
  onRemoveSkill: (id: string) => void;
  onSkillClick: (skill: Skill) => void;
  onSkillDoubleClick: (skill: Skill) => void;
}

export function SkillListContent({
  skills,
  hasActiveFilter,
  onRemoveSkill,
  onSkillClick,
  onSkillDoubleClick
}: SkillListContentProps) {
  if (skills.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        message="No skills yet"
        hint="Add one above to start tracking!"
        hasFilter={hasActiveFilter}
        filterMessage="No skills found with the applied filters."
      />
    );
  }

  return (
    <ListContainer>
      {skills.map((skill) => (
        <SkillItem
          key={skill.id}
          skill={skill}
          onClick={() => onSkillClick(skill)}
          onDoubleClick={() => onSkillDoubleClick(skill)}
          onRemoveSkill={onRemoveSkill}
        />
      ))}
    </ListContainer>
  );
}

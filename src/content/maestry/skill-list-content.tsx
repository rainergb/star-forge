import { Zap } from "lucide-react";
import { Skill } from "@/types/skill.types";
import { SkillItem } from "./skill-item";
import {
  ListContainer,
  CollapsibleSection,
  EmptyState
} from "@/components/shared/list-container";

interface SkillListContentProps {
  skills: Skill[];
  activeSkills: Skill[];
  archivedSkills: Skill[];
  hasActiveFilter: boolean;
  archivedCollapsed: boolean;
  onToggleArchivedCollapsed: () => void;
  onRemoveSkill: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onSkillClick: (skill: Skill) => void;
  onSkillDoubleClick: (skill: Skill) => void;
}

export function SkillListContent({
  skills,
  activeSkills,
  archivedSkills,
  hasActiveFilter,
  archivedCollapsed,
  onToggleArchivedCollapsed,
  onRemoveSkill,
  onToggleArchive,
  onSkillClick,
  onSkillDoubleClick
}: SkillListContentProps) {
  if (skills.length === 0 || (activeSkills.length === 0 && archivedSkills.length === 0)) {
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
      {activeSkills.map((skill) => (
        <SkillItem
          key={skill.id}
          skill={skill}
          onClick={() => onSkillClick(skill)}
          onDoubleClick={() => onSkillDoubleClick(skill)}
          onRemoveSkill={onRemoveSkill}
          onToggleArchive={onToggleArchive}
        />
      ))}

      {archivedSkills.length > 0 && (
        <CollapsibleSection
          label="Archived"
          count={archivedSkills.length}
          collapsed={archivedCollapsed}
          onToggle={onToggleArchivedCollapsed}
        >
          {archivedSkills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              onClick={() => onSkillClick(skill)}
              onDoubleClick={() => onSkillDoubleClick(skill)}
              onRemoveSkill={onRemoveSkill}
              onToggleArchive={onToggleArchive}
            />
          ))}
        </CollapsibleSection>
      )}
    </ListContainer>
  );
}

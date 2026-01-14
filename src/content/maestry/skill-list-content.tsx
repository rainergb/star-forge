import { ChevronDown, ChevronRight } from "lucide-react";
import { Skill } from "@/types/skill.types";
import { SkillItem } from "./skill-item";

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
  const sortedSkills = [...activeSkills, ...archivedSkills];

  return (
    <>
      <div className="w-full space-y-2 max-h-[60vh] overflow-y-auto scrollbar-none">
        {sortedSkills.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            {hasActiveFilter
              ? "No skills found with the applied filters."
              : "No skills yet. Add one above!"}
          </div>
        ) : (
          <>
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
              <>
                <button
                  onClick={onToggleArchivedCollapsed}
                  className="w-full flex items-center gap-2 px-2 py-2 text-white/50 hover:text-white/70 transition-colors cursor-pointer"
                >
                  {archivedCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    Archived ({archivedSkills.length})
                  </span>
                </button>

                {!archivedCollapsed &&
                  archivedSkills.map((skill) => (
                    <SkillItem
                      key={skill.id}
                      skill={skill}
                      onClick={() => onSkillClick(skill)}
                      onDoubleClick={() => onSkillDoubleClick(skill)}
                      onRemoveSkill={onRemoveSkill}
                      onToggleArchive={onToggleArchive}
                    />
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

import { Skill, SKILL_COLORS } from "@/types/skill.types";
import { CoverImageBanner } from "@/components/shared/cover-image-banner";
import { EditableTitle } from "@/components/shared/editable-title";

interface SkillHeaderProps {
  skill: Skill;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string | null) => void;
}

export function SkillHeader({ skill, onUpdateName, onUpdateImage }: SkillHeaderProps) {
  return (
    <div className="border-b border-white/10">
      {/* Image Banner */}
      <CoverImageBanner
        image={skill.image}
        alt={skill.name}
        onUpdateImage={onUpdateImage}
        height="md"
      />

      {/* Header Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              backgroundColor: `${SKILL_COLORS[skill.color].solid}20`,
              color: SKILL_COLORS[skill.color].solid
            }}
          >
            {skill.icon.type === "emoji" ? (
              skill.icon.value
            ) : (
              <span className="text-sm font-bold">
                {skill.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <EditableTitle
              value={skill.name}
              onChange={onUpdateName}
              mode="click-to-edit"
              showEditIcon
            />

            {skill.description && (
              <p className="text-white/50 text-sm mt-1 line-clamp-2">
                {skill.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

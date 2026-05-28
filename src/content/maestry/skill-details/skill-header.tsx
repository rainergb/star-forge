import { Skill, SkillColor, SkillIcon } from "@/types/skill.types";
import { CoverImageBanner } from "@/components/shared/cover-image-banner";
import { EditableTitle } from "@/components/shared/editable-title";
import { SkillIconColorSelector } from "../skill-icon-color-selector";

interface SkillHeaderProps {
  skill: Skill;
  onUpdateName: (name: string) => void;
  onUpdateImage: (image: string | null) => void;
  onUpdateIcon: (icon: SkillIcon) => void;
  onUpdateColor: (color: SkillColor) => void;
}

export function SkillHeader({
  skill,
  onUpdateName,
  onUpdateImage,
  onUpdateIcon,
  onUpdateColor
}: SkillHeaderProps) {
  return (
    <div className="border-b border-white/10">
      <CoverImageBanner
        image={skill.image}
        alt={skill.name}
        onUpdateImage={onUpdateImage}
        height="md"
      />

      <div className="flex items-center gap-3 p-4">
        <SkillIconColorSelector
          icon={skill.icon}
          color={skill.color}
          onChangeIcon={onUpdateIcon}
          onChangeColor={onUpdateColor}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <EditableTitle
            value={skill.name}
            onChange={onUpdateName}
            mode="always-editable"
            inputClassName="text-lg"
          />

          {skill.description && (
            <p className="text-white/50 text-sm mt-1 line-clamp-2">
              {skill.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { SkillColor, SKILL_COLORS } from "@/types/skill.types";
import { ColorPickerMenu, DEFAULT_COLOR_OPTIONS } from "@/components/shared/color-picker-menu";

interface SkillActionsSectionProps {
  color: SkillColor;
  onSetColor: (color: SkillColor) => void;
}

export function SkillActionsSection({
  color,
  onSetColor
}: SkillActionsSectionProps) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-1">
      <ColorPickerMenu
        value={color}
        onChange={onSetColor}
        colors={SKILL_COLORS}
        options={DEFAULT_COLOR_OPTIONS as unknown as { value: SkillColor; label: string }[]}
      />
    </div>
  );
}

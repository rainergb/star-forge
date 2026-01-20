import { Zap, X } from "lucide-react";
import { useSkills } from "@/hooks/use-skills";
import { SKILL_COLORS } from "@/types/skill.types";
import { DropdownSelector } from "@/components/shared/dropdown-selector";

interface SkillSelectorProps {
  selectedSkillIds: string[];
  onSelect: (skillIds: string[]) => void;
  className?: string;
}

export function SkillSelector({
  selectedSkillIds,
  onSelect,
  className
}: SkillSelectorProps) {
  const { skills, addSkill } = useSkills();

  // Transformar skills para o formato esperado pelo DropdownSelector
  const items = skills.map((s) => ({
    id: s.id,
    name: s.name,
    color: SKILL_COLORS[s.color].solid
  }));

  return (
    <DropdownSelector
      multiple
      items={items}
      selected={selectedSkillIds}
      onSelect={onSelect}
      icon={<Zap className="w-4 h-4 text-white/50" />}
      placeholder="Add skills"
      emptyText="No skills available"
      createLabel="Create new skill"
      onCreate={(name) => addSkill(name)}
      renderItemIcon={(item) => (
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: item.color }}
        />
      )}
      renderSelectedItem={(item, onRemove) => (
        <span
          key={item.id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
          style={{
            backgroundColor: `${item.color}20`,
            color: item.color
          }}
        >
          {item.name}
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:opacity-70">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      className={className}
    />
  );
}

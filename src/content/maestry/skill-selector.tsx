import { useState } from "react";
import { Check, Zap, X, Plus } from "lucide-react";
import { useSkills } from "@/hooks/use-skills";
import { SKILL_COLORS } from "@/types/skill.types";
import { cn } from "@/lib/utils";

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
  const [showMenu, setShowMenu] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const { activeSkills, getSkill, addSkill } = useSkills();

  const selectedSkills = selectedSkillIds
    .map((id) => getSkill(id))
    .filter(Boolean);

  const handleToggleSkill = (skillId: string) => {
    if (selectedSkillIds.includes(skillId)) {
      onSelect(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      onSelect([...selectedSkillIds, skillId]);
    }
  };

  const handleRemoveSkill = (skillId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selectedSkillIds.filter((id) => id !== skillId));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect([]);
  };

  const handleCreateSkill = () => {
    if (newSkillName.trim()) {
      const newId = addSkill(newSkillName.trim());
      onSelect([...selectedSkillIds, newId]);
      setIsCreating(false);
      setNewSkillName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCreateSkill();
    } else if (e.key === "Escape") {
      setIsCreating(false);
      setNewSkillName("");
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
      >
        <Zap className="w-4 h-4 text-white/50" />
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selectedSkills.length > 0 ? (
            <>
              {selectedSkills.map((skill) => (
                <span
                  key={skill!.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${SKILL_COLORS[skill!.color].solid}20`,
                    color: SKILL_COLORS[skill!.color].solid
                  }}
                >
                  {skill!.name}
                  <button
                    onClick={(e) => handleRemoveSkill(skill!.id, e)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </>
          ) : (
            <span className="text-white/70 text-sm">Add skills</span>
          )}
        </div>
        {selectedSkills.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-white/30 hover:text-white/70"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[200px] max-h-[300px] overflow-y-auto">
            <div className="py-1">
              {activeSkills.length > 0 ? (
                activeSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => handleToggleSkill(skill.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                      selectedSkillIds.includes(skill.id)
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: SKILL_COLORS[skill.color].solid
                      }}
                    />
                    <span className="truncate flex-1">{skill.name}</span>
                    {selectedSkillIds.includes(skill.id) && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-white/40 text-sm">
                  No skills available
                </div>
              )}

              {/* Create new skill */}
              <div className="border-t border-white/10 my-1" />
              {isCreating ? (
                <div className="px-3 py-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Skill name..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleCreateSkill}
                      disabled={!newSkillName.trim()}
                      className="flex-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewSkillName("");
                      }}
                      className="px-2 py-1 text-white/50 text-xs hover:text-white/70 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new skill</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

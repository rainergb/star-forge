import { useState } from "react";
import { Check } from "lucide-react";
import { SkillColor, SKILL_COLORS } from "@/types/skill.types";
import { cn } from "@/lib/utils";

interface SkillActionsSectionProps {
  color: SkillColor;
  onSetColor: (color: SkillColor) => void;
}

const COLOR_OPTIONS: { value: SkillColor; label: string }[] = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "cyan", label: "Cyan" },
  { value: "yellow", label: "Yellow" }
];

export function SkillActionsSection({
  color,
  onSetColor
}: SkillActionsSectionProps) {
  const [showColorMenu, setShowColorMenu] = useState(false);

  const selectedColorConfig = COLOR_OPTIONS.find((c) => c.value === color);

  const handleSelectColor = (newColor: SkillColor) => {
    onSetColor(newColor);
    setShowColorMenu(false);
  };

  return (
    <div className="mt-4 border-t border-white/10 pt-4 space-y-1">
      <div className="relative">
        <button
          onClick={() => setShowColorMenu(!showColorMenu)}
          className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: SKILL_COLORS[color].solid }}
          />
          <span className="text-white/70 text-sm">
            {selectedColorConfig?.label || "Color"}
          </span>
        </button>

        {showColorMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowColorMenu(false)}
            />
            <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]">
              <div className="py-1">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelectColor(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                      color === option.value
                        ? "text-primary bg-primary/10"
                        : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: SKILL_COLORS[option.value].solid
                      }}
                    />
                    <span>{option.label}</span>
                    {color === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

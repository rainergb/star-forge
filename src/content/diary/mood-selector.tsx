import { useState } from "react";
import { MoodLevel, MOOD_CONFIG, MOOD_LEVELS } from "@/types/diary.types";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  selectedMood: MoodLevel | null;
  onSelect: (mood: MoodLevel | null) => void;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  allowDeselect?: boolean;
}

export function MoodSelector({
  selectedMood,
  onSelect,
  size = "md",
  showLabels = false,
  allowDeselect = true
}: MoodSelectorProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodLevel | null>(null);

  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-xl"
  };

  const handleClick = (level: MoodLevel) => {
    if (selectedMood === level && allowDeselect) {
      onSelect(null);
    } else {
      onSelect(level);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {MOOD_LEVELS.map((level) => {
        const config = MOOD_CONFIG[level];
        const isSelected = selectedMood === level;
        const isHovered = hoveredMood === level;

        return (
          <button
            key={level}
            type="button"
            onClick={() => handleClick(level)}
            onMouseEnter={() => setHoveredMood(level)}
            onMouseLeave={() => setHoveredMood(null)}
            className={cn(
              "rounded-full flex items-center justify-center transition-all duration-200",
              sizeClasses[size],
              isSelected
                ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                : "opacity-60 hover:opacity-100 hover:scale-105",
              isHovered && !isSelected && "opacity-100"
            )}
            style={{
              backgroundColor: isSelected ? `${config.color}20` : "transparent",
              "--tw-ring-color": isSelected ? config.color : undefined
            } as React.CSSProperties}
            title={config.label}
          >
            <span
              className={cn(
                "transition-transform",
                isSelected && "scale-110"
              )}
            >
              {config.emoji}
            </span>
          </button>
        );
      })}
      {showLabels && (selectedMood || hoveredMood) && (
        <span
          className="ml-2 text-sm text-white/70 min-w-[80px]"
          style={{
            color:
              selectedMood || hoveredMood
                ? MOOD_CONFIG[selectedMood || hoveredMood!].color
                : undefined
          }}
        >
          {MOOD_CONFIG[selectedMood || hoveredMood!].label}
        </span>
      )}
    </div>
  );
}

interface MoodDisplayProps {
  mood: MoodLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MoodDisplay({
  mood,
  showLabel = false,
  size = "md"
}: MoodDisplayProps) {
  const config = MOOD_CONFIG[mood];

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={sizeClasses[size]}>{config.emoji}</span>
      {showLabel && (
        <span
          className={cn("text-sm", sizeClasses[size])}
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

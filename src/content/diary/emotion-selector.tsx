import { EmotionType, EMOTION_CONFIG, EMOTION_TYPES } from "@/types/diary.types";
import { cn } from "@/lib/utils";

interface EmotionSelectorProps {
  selectedEmotions: EmotionType[];
  onSelect: (emotions: EmotionType[]) => void;
  maxSelections?: number;
}

export function EmotionSelector({
  selectedEmotions,
  onSelect,
  maxSelections = 3
}: EmotionSelectorProps) {
  const handleToggle = (emotion: EmotionType) => {
    if (selectedEmotions.includes(emotion)) {
      onSelect(selectedEmotions.filter((e) => e !== emotion));
    } else if (selectedEmotions.length < maxSelections) {
      onSelect([...selectedEmotions, emotion]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">How are you feeling?</span>
        <span className="text-xs text-white/40">
          {selectedEmotions.length}/{maxSelections} selected
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {EMOTION_TYPES.map((emotion) => {
          const config = EMOTION_CONFIG[emotion];
          const isSelected = selectedEmotions.includes(emotion);
          const isDisabled = !isSelected && selectedEmotions.length >= maxSelections;

          return (
            <button
              key={emotion}
              type="button"
              onClick={() => handleToggle(emotion)}
              disabled={isDisabled}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer",
                isSelected
                  ? "bg-white/10 ring-1 ring-white/30"
                  : "hover:bg-white/5",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
              style={{
                backgroundColor: isSelected ? `${config.color}20` : undefined
              }}
            >
              <span className="text-xl">{config.emoji}</span>
              <span
                className="text-xs"
                style={{ color: isSelected ? config.color : "rgba(255,255,255,0.5)" }}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>

      {selectedEmotions.length > 0 && (
        <button
          onClick={() => onSelect([])}
          className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer self-end"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

interface EmotionDisplayProps {
  emotions: EmotionType[];
  size?: "sm" | "md";
  showLabels?: boolean;
  maxDisplay?: number;
}

export function EmotionDisplay({
  emotions,
  size = "sm",
  showLabels = false,
  maxDisplay = 3
}: EmotionDisplayProps) {
  if (emotions.length === 0) return null;

  const displayEmotions = emotions.slice(0, maxDisplay);
  const remaining = emotions.length - maxDisplay;

  const sizeClasses = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5"
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size])}>
      {displayEmotions.map((emotion) => {
        const config = EMOTION_CONFIG[emotion];
        return (
          <span
            key={emotion}
            title={config.label}
            className="flex items-center gap-0.5"
          >
            <span>{config.emoji}</span>
            {showLabels && (
              <span className="text-xs" style={{ color: config.color }}>
                {config.label}
              </span>
            )}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="text-xs text-white/40">+{remaining}</span>
      )}
    </div>
  );
}

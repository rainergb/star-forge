import { MoodEntry, MoodLevel, MOOD_CONFIG, EmotionType } from "@/types/diary.types";
import { MoodSelector, MoodDisplay } from "../mood-selector";
import { EmotionSelector, EmotionDisplay } from "../emotion-selector";
import { Trash2 } from "lucide-react";

interface DiaryMoodSectionProps {
  mood: MoodEntry | null;
  onSetMood: (mood: MoodEntry | null) => void;
}

export function DiaryMoodSection({ mood, onSetMood }: DiaryMoodSectionProps) {
  const handleMoodSelect = (level: MoodLevel | null) => {
    if (level) {
      onSetMood({
        level,
        emoji: MOOD_CONFIG[level].emoji,
        emotions: mood?.emotions ?? [],
        note: mood?.note ?? null
      });
    } else if (!mood?.emotions?.length) {
      onSetMood(null);
    }
  };

  const handleEmotionsSelect = (emotions: EmotionType[]) => {
    if (emotions.length > 0 || mood?.level) {
      onSetMood({
        level: mood?.level || 3,
        emoji: mood?.level ? MOOD_CONFIG[mood.level].emoji : "😐",
        emotions,
        note: mood?.note ?? null
      });
    } else {
      onSetMood(null);
    }
  };

  const handleRemoveMood = () => {
    onSetMood(null);
  };

  const hasMoodData = mood && (mood.level || (mood.emotions && mood.emotions.length > 0));

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70">Mood & Feelings</h3>
        {hasMoodData && (
          <button
            onClick={handleRemoveMood}
            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
            title="Remove mood"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Current mood display */}
        {hasMoodData && (
          <div className="flex items-center gap-3 flex-wrap pb-3 border-b border-white/5">
            {mood.level && <MoodDisplay mood={mood.level} showLabel size="md" />}
            {mood.emotions && mood.emotions.length > 0 && (
              <EmotionDisplay emotions={mood.emotions} size="md" showLabels />
            )}
          </div>
        )}

        {/* Mood Selector - always visible for quick selection */}
        <div>
          <span className="text-xs text-white/50 mb-2 block">
            {hasMoodData ? "Change mood" : "How are you feeling?"}
          </span>
          <MoodSelector
            selectedMood={mood?.level ?? null}
            onSelect={handleMoodSelect}
            size="md"
            showLabels
          />
        </div>

        {/* Emotion Selector */}
        <EmotionSelector
          selectedEmotions={mood?.emotions ?? []}
          onSelect={handleEmotionsSelect}
          maxSelections={3}
        />
      </div>
    </div>
  );
}

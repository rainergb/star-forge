import { useState } from "react";
import { MoodEntry, MoodLevel, MOOD_CONFIG } from "@/types/diary.types";
import { MoodSelector, MoodDisplay } from "../mood-selector";
import { Pencil, X } from "lucide-react";

interface DiaryMoodSectionProps {
  mood: MoodEntry | null;
  onSetMood: (mood: MoodEntry | null) => void;
}

export function DiaryMoodSection({ mood, onSetMood }: DiaryMoodSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(
    mood?.level ?? null
  );
  const [moodNote, setMoodNote] = useState(mood?.note ?? "");

  const handleSave = () => {
    if (selectedMood) {
      onSetMood({
        level: selectedMood,
        emoji: MOOD_CONFIG[selectedMood].emoji,
        note: moodNote.trim() || null
      });
    } else {
      onSetMood(null);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedMood(mood?.level ?? null);
    setMoodNote(mood?.note ?? "");
    setIsEditing(false);
  };

  const handleRemoveMood = () => {
    onSetMood(null);
    setSelectedMood(null);
    setMoodNote("");
  };

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white/70">Mood</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <MoodSelector
            selectedMood={selectedMood}
            onSelect={setSelectedMood}
            size="lg"
            showLabels
          />

          {selectedMood && (
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="Add a note about your mood..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-primary/50"
            />
          )}

          <div className="flex items-center gap-2 justify-end">
            {mood && (
              <button
                onClick={handleRemoveMood}
                className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors"
              >
                Remove
              </button>
            )}
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : mood ? (
        <div className="flex items-center gap-3">
          <MoodDisplay mood={mood.level} showLabel size="md" />
          {mood.note && (
            <span className="text-sm text-white/50 italic">"{mood.note}"</span>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          + Add mood to this entry
        </button>
      )}
    </div>
  );
}

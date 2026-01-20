import { useState } from "react";
import { Smile, Calendar } from "lucide-react";
import { DiaryEntryType, MoodLevel, MoodEntry, MOOD_CONFIG, EmotionType } from "@/types/diary.types";
import { MoodSelector } from "./mood-selector";
import { EmotionSelector, EmotionDisplay } from "./emotion-selector";
import { ControlledListInput } from "@/components/shared/list-input";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";

interface DiaryInputProps {
  onAddEntry: (
    content: string,
    type: DiaryEntryType,
    options?: {
      mood?: MoodEntry | null;
      tags?: string[];
      time?: string | null;
      date?: string;
    }
  ) => void;
  selectedDate?: string;
}

const entryTypes: { type: DiaryEntryType; label: string; icon: string }[] = [
  { type: "note", label: "Note", icon: "📝" },
  { type: "event", label: "Event", icon: "📅" },
  { type: "mood", label: "Mood", icon: "😊" }
];

const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function DiaryInput({ onAddEntry, selectedDate }: DiaryInputProps) {
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<DiaryEntryType>("note");
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const [entryDate, setEntryDate] = useState<string>(selectedDate || getTodayDate());
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  const handleSubmit = () => {
    if (!content.trim() && !selectedMood && selectedEmotions.length === 0) return;

    const mood: MoodEntry | null = selectedMood || selectedEmotions.length > 0
      ? {
          level: selectedMood || 3,
          emoji: selectedMood ? MOOD_CONFIG[selectedMood].emoji : "😐",
          emotions: selectedEmotions,
          note: null
        }
      : null;

    const finalType = (selectedMood || selectedEmotions.length > 0) && !content.trim() ? "mood" : entryType;
    const finalContent = content.trim() || 
      (selectedEmotions.length > 0 
        ? `Feeling ${selectedEmotions.join(", ")}`
        : selectedMood ? MOOD_CONFIG[selectedMood].label : "");

    onAddEntry(finalContent, finalType, {
      mood,
      tags: [],
      time: new Date().toTimeString().slice(0, 5),
      date: entryDate
    });

    setContent("");
    setSelectedMood(null);
    setSelectedEmotions([]);
    setShowMoodSelector(false);
  };

  const handleDateSave = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setEntryDate(dateStr);
    setShowDatePicker(false);
  };

  const formatEntryDate = () => {
    const [year, month, day] = entryDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (isToday(date)) return "Today";
    return format(date, "MMM d");
  };

  const diaryActions = (
    <div className="flex items-center gap-1">
      {/* Date picker */}
      <button
        onClick={() => setShowDatePicker(!showDatePicker)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer",
          entryDate !== getTodayDate()
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        )}
        title="Entry date"
      >
        <Calendar className="w-3 h-3" />
        <span>{formatEntryDate()}</span>
      </button>

      {/* Mood/Emotions picker */}
      <button
        onClick={() => setShowMoodSelector(!showMoodSelector)}
        className={cn(
          "flex items-center gap-1 p-1.5 rounded-md transition-colors cursor-pointer",
          showMoodSelector || selectedMood || selectedEmotions.length > 0
            ? "text-primary bg-primary/20"
            : "text-white/40 hover:text-white/70 hover:bg-white/5"
        )}
        title="Add mood"
      >
        <Smile className="w-4 h-4" />
        {selectedEmotions.length > 0 && (
          <EmotionDisplay emotions={selectedEmotions} size="sm" maxDisplay={2} />
        )}
      </button>

      {/* Entry type selector */}
      <button
        onClick={() => setShowTypeMenu(!showTypeMenu)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <span>{entryTypes.find((t) => t.type === entryType)?.icon}</span>
        <span>{entryTypes.find((t) => t.type === entryType)?.label}</span>
      </button>
    </div>
  );

  const diaryPopovers = (
    <>
      {showDatePicker && (
        <DateTimePickerPopover
          title="Entry date"
          initialDate={(() => {
            const [year, month, day] = entryDate.split("-").map(Number);
            return new Date(year, month - 1, day);
          })()}
          onSave={handleDateSave}
          onClose={() => setShowDatePicker(false)}
          showTime={false}
        />
      )}

      {showTypeMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowTypeMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 py-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20">
            {entryTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => {
                  setEntryType(type.type);
                  setShowTypeMenu(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-white/5 transition-colors cursor-pointer",
                  entryType === type.type ? "text-primary" : "text-white/70"
                )}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {showMoodSelector && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMoodSelector(false)}
          />
          <div className="absolute right-0 top-full mt-1 p-3 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 min-w-[320px]">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-white/50 mb-2 block">Overall mood</span>
                <MoodSelector
                  selectedMood={selectedMood}
                  onSelect={setSelectedMood}
                  size="md"
                  showLabels
                />
              </div>
              <EmotionSelector
                selectedEmotions={selectedEmotions}
                onSelect={setSelectedEmotions}
                maxSelections={3}
              />
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <ControlledListInput
      value={content}
      onChange={setContent}
      onSubmit={handleSubmit}
      placeholder="What's on your mind?"
      actions={diaryActions}
      popoverContent={diaryPopovers}
      expandable
      maxHeight={300}
    />
  );
}

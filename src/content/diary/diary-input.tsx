import { useState, useRef } from "react";
import { Send, Smile } from "lucide-react";
import { DiaryEntryType, MoodLevel, MoodEntry, MOOD_CONFIG } from "@/types/diary.types";
import { MoodSelector } from "./mood-selector";
import { cn } from "@/lib/utils";

interface DiaryInputProps {
  onAddEntry: (
    content: string,
    type: DiaryEntryType,
    options?: {
      mood?: MoodEntry | null;
      tags?: string[];
      time?: string | null;
    }
  ) => void;
  selectedDate: string;
}

const entryTypes: { type: DiaryEntryType; label: string; icon: string }[] = [
  { type: "note", label: "Note", icon: "📝" },
  { type: "event", label: "Event", icon: "📅" },
  { type: "mood", label: "Mood", icon: "😊" }
];

export function DiaryInput({ onAddEntry, selectedDate }: DiaryInputProps) {
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<DiaryEntryType>("note");
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!content.trim() && !selectedMood) return;

    const mood: MoodEntry | null = selectedMood
      ? {
          level: selectedMood,
          emoji: MOOD_CONFIG[selectedMood].emoji,
          note: null
        }
      : null;

    const finalType = selectedMood && !content.trim() ? "mood" : entryType;
    const finalContent = content.trim() || MOOD_CONFIG[selectedMood!].label;

    onAddEntry(finalContent, finalType, {
      mood,
      tags: [],
      time: new Date().toTimeString().slice(0, 5)
    });

    setContent("");
    setSelectedMood(null);
    setShowMoodSelector(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="w-full relative">
      <div className="w-full flex flex-col gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <div className="flex items-start gap-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none resize-none min-h-[24px] max-h-[120px]"
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() && !selectedMood}
            className={cn(
              "p-2 rounded-full transition-all",
              content.trim() || selectedMood
                ? "text-primary hover:bg-primary/20"
                : "text-white/20 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                showMoodSelector || selectedMood
                  ? "bg-primary/20 text-primary"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
              title="Add mood"
            >
              <Smile className="w-4 h-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
              >
                <span>{entryTypes.find((t) => t.type === entryType)?.icon}</span>
                <span>{entryTypes.find((t) => t.type === entryType)?.label}</span>
              </button>

              {showTypeMenu && (
                <div className="absolute bottom-full left-0 mb-1 py-1 bg-background border border-white/10 rounded-lg shadow-lg z-10">
                  {entryTypes.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        setEntryType(type.type);
                        setShowTypeMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-white/5 transition-colors",
                        entryType === type.type
                          ? "text-primary"
                          : "text-white/70"
                      )}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <span className="text-xs text-white/30">{selectedDate}</span>
        </div>

        {showMoodSelector && (
          <div className="pt-2 border-t border-white/5">
            <MoodSelector
              selectedMood={selectedMood}
              onSelect={setSelectedMood}
              size="md"
              showLabels
            />
          </div>
        )}
      </div>
    </div>
  );
}

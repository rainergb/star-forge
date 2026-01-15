import { Star } from "lucide-react";
import { DiaryEntry, ENTRY_TYPE_CONFIG } from "@/types/diary.types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DiaryHeaderProps {
  entry: DiaryEntry;
  onToggleFavorite: () => void;
}

export function DiaryHeader({ entry, onToggleFavorite }: DiaryHeaderProps) {
  const typeConfig = ENTRY_TYPE_CONFIG[entry.type];

  const formatDateTime = () => {
    const [year, month, day] = entry.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dateStr = format(dateObj, "MMMM d, yyyy");

    if (entry.time) {
      return `${dateStr} at ${entry.time}`;
    }
    return dateStr;
  };

  return (
    <div className="px-6 py-4 border-b border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeConfig.icon}</span>
          <div>
            <span className="text-sm font-medium text-white/90">
              {typeConfig.label}
            </span>
            <p className="text-xs text-white/40 mt-0.5">{formatDateTime()}</p>
          </div>
        </div>

        <button
          onClick={onToggleFavorite}
          className={cn(
            "p-2 rounded-full transition-colors",
            entry.favorite
              ? "text-yellow-400 bg-yellow-400/10"
              : "text-white/30 hover:text-yellow-400 hover:bg-white/5"
          )}
        >
          <Star
            className="w-5 h-5"
            fill={entry.favorite ? "currentColor" : "none"}
          />
        </button>
      </div>
    </div>
  );
}

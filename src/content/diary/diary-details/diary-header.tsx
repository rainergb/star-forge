import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { DiaryEntry, DiaryEntryType, ENTRY_TYPE_CONFIG } from "@/types/diary.types";
import { format, isToday } from "date-fns";
import { FavoriteButton } from "@/components/shared/favorite-button";
import { CoverImageBanner } from "@/components/shared/cover-image-banner";
import { DateTimePickerPopover } from "@/components/ui/date-time-picker-popover";
import { cn } from "@/lib/utils";

interface DiaryHeaderProps {
  entry: DiaryEntry;
  onToggleFavorite: () => void;
  onUpdateType?: (type: DiaryEntryType) => void;
  onUpdateImage?: (image: string | null) => void;
  onUpdateDate?: (date: string, time: string | null) => void;
}

const EDITABLE_TYPES: DiaryEntryType[] = ["note", "event", "mood"];

export function DiaryHeader({ entry, onToggleFavorite, onUpdateType, onUpdateImage, onUpdateDate }: DiaryHeaderProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const typeConfig = ENTRY_TYPE_CONFIG[entry.type];
  const canEditType = EDITABLE_TYPES.includes(entry.type);

  const getEntryDate = () => {
    const [year, month, day] = entry.date.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateTime = () => {
    const dateObj = getEntryDate();
    const dateStr = format(dateObj, "MMMM d, yyyy");

    if (entry.time) {
      return `${dateStr} at ${entry.time}`;
    }
    return dateStr;
  };

  const formatShortDate = () => {
    const dateObj = getEntryDate();
    if (isToday(dateObj)) return "Today";
    return format(dateObj, "MMM d");
  };

  const handleDateSave = (date: Date) => {
    if (onUpdateDate) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      onUpdateDate(dateStr, timeStr);
    }
    setShowDatePicker(false);
  };

  const handleTypeSelect = (type: DiaryEntryType) => {
    if (onUpdateType) {
      onUpdateType(type);
    }
    setShowTypeMenu(false);
  };

  return (
    <div className="border-b border-white/10">
      {onUpdateImage && (
        <CoverImageBanner
          image={entry.image}
          alt={entry.content.slice(0, 50)}
          onUpdateImage={onUpdateImage}
          height="md"
        />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 relative">
            {canEditType && onUpdateType ? (
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="flex items-center gap-1 text-2xl hover:bg-white/5 p-1 rounded-lg transition-colors cursor-pointer"
              >
                {typeConfig.icon}
                <ChevronDown className="w-3 h-3 text-white/40" />
              </button>
            ) : (
              <span className="text-2xl p-1">{typeConfig.icon}</span>
            )}

            {showTypeMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTypeMenu(false)}
                />
                <div className="absolute left-0 top-full mt-1 py-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 min-w-[140px]">
                  {EDITABLE_TYPES.map((type) => {
                    const config = ENTRY_TYPE_CONFIG[type];
                    return (
                      <button
                        key={type}
                        onClick={() => handleTypeSelect(type)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-white/5 transition-colors cursor-pointer",
                          entry.type === type ? "text-primary" : "text-white/70"
                        )}
                      >
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="relative">
              <span className="text-sm font-medium text-white/90">
                {typeConfig.label}
              </span>
              {onUpdateDate ? (
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="flex items-center gap-1 text-xs text-white/40 mt-0.5 hover:text-white/70 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{formatShortDate()}</span>
                  {entry.time && <span>at {entry.time}</span>}
                </button>
              ) : (
                <p className="text-xs text-white/40 mt-0.5">{formatDateTime()}</p>
              )}

              {showDatePicker && (
                <DateTimePickerPopover
                  title="Entry date & time"
                  initialDate={(() => {
                    const date = getEntryDate();
                    if (entry.time) {
                      const [hours, minutes] = entry.time.split(":").map(Number);
                      date.setHours(hours, minutes);
                    }
                    return date;
                  })()}
                  onSave={handleDateSave}
                  onClose={() => setShowDatePicker(false)}
                  showTime
                />
              )}
            </div>
          </div>

          <FavoriteButton
            isFavorite={entry.favorite}
            onToggle={onToggleFavorite}
            color="yellow"
            className={entry.favorite ? "p-2 rounded-full bg-yellow-400/10" : "p-2 rounded-full hover:bg-white/5"}
          />
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Trash2, Clock, Tag, FileText, Image } from "lucide-react";
import { DiaryEntry, ENTRY_TYPE_CONFIG } from "@/types/diary.types";
import { MoodDisplay } from "./mood-selector";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/shared/favorite-button";

interface DiaryItemProps {
  entry: DiaryEntry;
  onToggleFavorite: (id: string) => void;
  onRemove: (id: string) => void;
  onClick: () => void;
}

export function DiaryItem({
  entry,
  onToggleFavorite,
  onRemove,
  onClick
}: DiaryItemProps) {
  const [showActions, setShowActions] = useState(false);

  const typeConfig = ENTRY_TYPE_CONFIG[entry.type];
  const hasFiles = entry.files.length > 0;
  const hasImages = entry.files.some((f) => f.type === "image");

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(entry.id);
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all",
        "bg-background/30 hover:bg-background/50 border border-transparent hover:border-white/10"
      )}
    >
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        {entry.time && (
          <span className="text-xs text-white/40 font-mono">{entry.time}</span>
        )}
        <span className="text-lg" title={typeConfig.label}>
          {typeConfig.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm text-white/90 break-words",
              entry.type === "mood" && "font-medium"
            )}
          >
            {entry.content}
          </p>

          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              showActions ? "opacity-100" : "opacity-0"
            )}
          >
            <FavoriteButton
              isFavorite={entry.favorite}
              onToggle={() => onToggleFavorite(entry.id)}
              size="sm"
              color="yellow"
            />
            <button
              onClick={handleRemoveClick}
              className="p-1 rounded-full text-white/30 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {entry.mood && (
            <MoodDisplay mood={entry.mood.level} showLabel size="sm" />
          )}

          {entry.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-white/30" />
              <span className="text-xs text-white/40">
                {entry.tags.slice(0, 3).join(", ")}
                {entry.tags.length > 3 && ` +${entry.tags.length - 3}`}
              </span>
            </div>
          )}

          {hasFiles && (
            <div className="flex items-center gap-1 text-white/40">
              {hasImages ? (
                <Image className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              <span className="text-xs">{entry.files.length}</span>
            </div>
          )}

          {entry.linkedTaskId && (
            <span className="text-xs text-primary/70 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Linked task
            </span>
          )}
        </div>
      </div>

      {entry.favorite && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-yellow-400/80 border-r-transparent rounded-tr-lg" />
      )}
    </div>
  );
}

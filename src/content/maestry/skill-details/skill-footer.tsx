import { format } from "date-fns";
import { Trash2, Archive } from "lucide-react";

interface SkillFooterProps {
  createdAt: number;
  archived: boolean;
  onDelete: () => void;
  onToggleArchive: () => void;
}

export function SkillFooter({
  createdAt,
  archived,
  onDelete,
  onToggleArchive
}: SkillFooterProps) {
  return (
    <div className="p-4 border-t border-white/10 mt-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">
          Created {format(new Date(createdAt), "MMM d, yyyy")}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/50 hover:text-white/70 hover:bg-white/5 rounded-lg text-sm transition-colors"
          >
            <Archive className="w-4 h-4" />
            {archived ? "Unarchive" : "Archive"}
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

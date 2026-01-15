import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface DiaryFooterProps {
  createdAt: number;
  updatedAt: number;
  onDelete: () => void;
}

export function DiaryFooter({
  createdAt,
  updatedAt,
  onDelete
}: DiaryFooterProps) {
  const formatTimestamp = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' HH:mm");
  };

  const wasUpdated = updatedAt > createdAt + 1000;

  return (
    <div className="px-6 py-4 border-t border-white/10 mt-auto">
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/40">
          <p>Created {formatTimestamp(createdAt)}</p>
          {wasUpdated && (
            <p className="mt-0.5">Updated {formatTimestamp(updatedAt)}</p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

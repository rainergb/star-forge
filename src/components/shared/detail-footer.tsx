import { format, formatDistanceToNow } from "date-fns";
import { Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DetailFooterProps {
  createdAt: number;
  updatedAt?: number;
  onDelete: () => void;
  onExport?: () => void;
  dateFormat?: "absolute" | "relative";
  className?: string;
}

export function DetailFooter({
  createdAt,
  updatedAt,
  onDelete,
  onExport,
  dateFormat = "absolute",
  className
}: DetailFooterProps) {
  const formatTimestamp = (timestamp: number) => {
    if (dateFormat === "relative") {
      return `Created ${formatDistanceToNow(new Date(timestamp), { addSuffix: true })}`;
    }
    return `Created ${format(new Date(timestamp), "MMM d, yyyy 'at' HH:mm")}`;
  };

  const formatUpdated = (timestamp: number) => {
    return `Updated ${format(new Date(timestamp), "MMM d, yyyy 'at' HH:mm")}`;
  };

  const wasUpdated = updatedAt && updatedAt > createdAt + 1000;

  return (
    <div
      className={cn(
        "mt-auto px-4 py-4 border-t border-white/10 flex items-center justify-between",
        className
      )}
    >
      <div className="text-xs text-white/40">
        <p>{formatTimestamp(createdAt)}</p>
        {wasUpdated && <p className="mt-0.5">{formatUpdated(updatedAt)}</p>}
      </div>

      <div className="flex items-center gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg text-sm transition-colors cursor-pointer"
            title="Export as JSON"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

import { Trash2 } from "lucide-react";

interface ProjectFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function ProjectFooter({ createdAt, onDelete }: ProjectFooterProps) {
  const formatCreatedAt = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Created just now";
    if (minutes < 60)
      return `Created ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `Created ${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `Created ${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
      <span className="text-xs text-white/40">
        {formatCreatedAt(createdAt)}
      </span>
      <button
        onClick={onDelete}
        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

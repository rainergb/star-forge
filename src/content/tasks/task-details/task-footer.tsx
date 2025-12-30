import { Trash2 } from "lucide-react";

interface TaskFooterProps {
  createdAt: number;
  onDelete: () => void;
}

export function TaskFooter({ createdAt, onDelete }: TaskFooterProps) {
  const formatCreatedAt = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Criada há alguns instantes";
    if (minutes < 60) return `Criada há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    if (hours < 24) return `Criada há ${hours} hora${hours > 1 ? "s" : ""}`;
    return `Criada há ${days} dia${days > 1 ? "s" : ""}`;
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

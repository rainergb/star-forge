import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e?: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  color?: "yellow" | "purple";
  className?: string;
  stopPropagation?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6"
};

const colorClasses = {
  yellow: {
    active: "text-yellow-400",
    inactive: "text-white/30 hover:text-yellow-400"
  },
  purple: {
    active: "text-[#D6B8FF]",
    inactive: "text-white/30 hover:text-[#D6B8FF]"
  }
};

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = "md",
  color = "yellow",
  className,
  stopPropagation = true
}: FavoriteButtonProps) {
  const colors = colorClasses[color];

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    onToggle(e);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-colors shrink-0",
        isFavorite ? colors.active : colors.inactive,
        className
      )}
    >
      <Star
        className={sizeClasses[size]}
        fill={isFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}

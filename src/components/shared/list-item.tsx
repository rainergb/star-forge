import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListItemProps {
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  leading?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
  borderColor?: string;
  isActive?: boolean;
  isDisabled?: boolean;
}

export function ListItem({
  onClick,
  onDoubleClick,
  onContextMenu,
  leading,
  children,
  trailing,
  className,
  borderColor,
  isActive = false,
  isDisabled = false
}: ListItemProps) {
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-background/50 border rounded-lg hover:bg-white/5 transition-colors cursor-pointer",
        isActive ? "border-primary/50 bg-primary/5" : "border-white/10",
        isDisabled && "opacity-50",
        className
      )}
      style={borderColor ? { borderColor } : undefined}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leading}
        <div className="flex flex-col flex-1 min-w-0">{children}</div>
      </div>
      {trailing && <div className="flex items-center gap-3 shrink-0">{trailing}</div>}
    </div>
  );
}

interface ListItemTitleProps {
  children: ReactNode;
  strikethrough?: boolean;
  className?: string;
}

export function ListItemTitle({
  children,
  strikethrough = false,
  className
}: ListItemTitleProps) {
  return (
    <span
      className={cn(
        "text-white/90",
        strikethrough && "line-through text-white/50",
        className
      )}
    >
      {children}
    </span>
  );
}

interface ListItemMetaProps {
  children: ReactNode;
  className?: string;
}

export function ListItemMeta({ children, className }: ListItemMetaProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap mt-0.5", className)}>
      {children}
    </div>
  );
}

interface ListItemBadgeProps {
  children: ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function ListItemBadge({
  children,
  color,
  bgColor,
  className
}: ListItemBadgeProps) {
  return (
    <span
      className={cn("text-xs px-1.5 py-0.5 rounded", className)}
      style={{
        backgroundColor: bgColor || `${color}20`,
        color: color
      }}
    >
      {children}
    </span>
  );
}

interface ListItemStatProps {
  icon: ReactNode;
  children: ReactNode;
  color?: string;
  className?: string;
}

export function ListItemStat({
  icon,
  children,
  color = "text-white/50",
  className
}: ListItemStatProps) {
  return (
    <span className={cn("flex items-center gap-1 text-xs", color, className)}>
      {icon}
      {children}
    </span>
  );
}

interface ListItemProgressProps {
  value: number;
  max?: number;
  color?: string;
  width?: string;
  className?: string;
}

export function ListItemProgress({
  value,
  max = 100,
  color = "bg-primary",
  width = "w-24",
  className
}: ListItemProgressProps) {
  const percentage = Math.min(100, (value / max) * 100);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-1.5 bg-white/10 rounded-full overflow-hidden", width)}>
        <div
          className={cn("h-full rounded-full transition-all duration-300")}
          style={{
            width: `${percentage}%`,
            backgroundColor: color.startsWith("bg-") ? undefined : color
          }}
        />
      </div>
      <span className="text-xs text-white/40 w-8 text-right">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

interface ListItemIconProps {
  icon: ReactNode;
  color?: string;
  bgColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const iconSizes = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5"
};

export function ListItemIcon({
  icon,
  color,
  bgColor,
  size = "md",
  className
}: ListItemIconProps) {
  return (
    <div
      className={cn("rounded-lg shrink-0", iconSizes[size], className)}
      style={{
        backgroundColor: bgColor,
        color: color
      }}
    >
      {icon}
    </div>
  );
}

interface ListItemColorBarProps {
  color: string;
  className?: string;
}

export function ListItemColorBar({ color, className }: ListItemColorBarProps) {
  return (
    <div
      className={cn("w-2 h-8 rounded-full shrink-0", className)}
      style={{ backgroundColor: color }}
    />
  );
}

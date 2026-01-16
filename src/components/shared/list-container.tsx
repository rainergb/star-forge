import { ReactNode } from "react";
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function CollapsibleSection({
  label,
  count,
  collapsed,
  onToggle,
  children
}: CollapsibleSectionProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2 text-white/50 hover:text-white/70 transition-colors cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <span className="text-sm">{label}</span>
        <span className="text-sm text-white/40">({count})</span>
      </button>

      {!collapsed && children}
    </>
  );
}

interface ListContainerProps {
  children: ReactNode;
  className?: string;
}

export function ListContainer({ children, className }: ListContainerProps) {
  return (
    <div
      className={cn(
        "w-full space-y-2 max-h-[60vh] overflow-y-auto scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  hint?: string;
  hasFilter?: boolean;
  filterMessage?: string;
}

export function EmptyState({
  icon: Icon,
  message,
  hint,
  hasFilter,
  filterMessage
}: EmptyStateProps) {
  const displayMessage = hasFilter && filterMessage ? filterMessage : message;

  return (
    <div className="flex flex-col items-center justify-center py-8 text-white/40">
      {Icon && <Icon className="w-12 h-12 mb-3 opacity-50" />}
      <p className="text-sm text-center">{displayMessage}</p>
      {hint && !hasFilter && (
        <p className="text-xs mt-1 text-center">{hint}</p>
      )}
    </div>
  );
}

interface ListSummaryProps {
  completed: number;
  total: number;
  label?: string;
}

export function ListSummary({
  completed,
  total,
  label = "completed"
}: ListSummaryProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-sm text-white/40">
        {completed} of {total} {label}
      </div>
    </div>
  );
}

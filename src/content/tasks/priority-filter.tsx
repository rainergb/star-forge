import { useState } from "react";
import { Check, ChevronDown, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { TaskPriority } from "@/types/task.types";
import { cn } from "@/lib/utils";

const PRIORITY_OPTIONS: { value: NonNullable<TaskPriority>; label: string; color: string }[] = [
  { value: "high", label: "High", color: "text-red-400" },
  { value: "medium", label: "Medium", color: "text-yellow-400" },
  { value: "low", label: "Low", color: "text-green-400" }
];

interface PriorityFilterProps {
  selectedPriorities: TaskPriority[];
  onSelectionChange: (priorities: TaskPriority[]) => void;
  className?: string;
}

export function PriorityFilter({
  selectedPriorities,
  onSelectionChange,
  className
}: PriorityFilterProps) {
  const [open, setOpen] = useState(false);

  const togglePriority = (priority: TaskPriority) => {
    const newSelection = selectedPriorities.includes(priority)
      ? selectedPriorities.filter((p) => p !== priority)
      : [...selectedPriorities, priority];
    onSelectionChange(newSelection);
  };

  const clearFilters = () => {
    onSelectionChange([]);
    setOpen(false);
  };

  const hasActiveFilters = selectedPriorities.length > 0;

  const getFilterLabel = (): string => {
    if (!hasActiveFilters) return "Priority";
    if (selectedPriorities.length === 1) {
      const priority = PRIORITY_OPTIONS.find((p) => p.value === selectedPriorities[0]);
      return priority?.label || "1 priority";
    }
    return `${selectedPriorities.length} selected`;
  };

  return (
    <div className={cn("shrink-0", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-between bg-background/50 border-white/10 rounded-lg hover:bg-white/5 text-white/70 h-9 px-3",
              hasActiveFilters && "border-primary/50 text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <Flag className="w-3.5 h-3.5" />
              <span className="text-xs">{getFilterLabel()}</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {hasActiveFilters && (
                <X
                  className="w-3.5 h-3.5 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                />
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-48 p-2 bg-[#12142a] border-white/10"
          align="start"
        >
          <div className="space-y-1">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => togglePriority(option.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors cursor-pointer",
                  selectedPriorities.includes(option.value)
                    ? "bg-primary/20 text-white"
                    : "text-white/70 hover:bg-white/5"
                )}
              >
                <Flag className={cn("w-4 h-4", option.color)} />
                <span className="flex-1 text-left">{option.label}</span>
                {selectedPriorities.includes(option.value) && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <>
              <div className="my-2 border-t border-white/10" />
              <button
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-md text-sm text-white/50 hover:text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                Clear filter
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

import { useState } from "react";
import { Check, ChevronDown, ChevronLeft, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { DateRange } from "react-day-picker";

type DateFilterOption =
  | "all"
  | "today"
  | "tomorrow"
  | "week"
  | "overdue"
  | "no-date"
  | "custom";

interface CustomDateRange {
  start: Date | null;
  end: Date | null;
}

const DATE_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This week" },
  { value: "overdue", label: "Overdue" },
  { value: "no-date", label: "No due date" },
  { value: "custom", label: "Custom range" }
];

interface DateFilterProps {
  selectedFilter: DateFilterOption;
  onFilterChange: (filter: DateFilterOption) => void;
  customRange?: CustomDateRange;
  onCustomRangeChange?: (range: CustomDateRange) => void;
  className?: string;
}

export function DateFilter({
  selectedFilter,
  onFilterChange,
  customRange,
  onCustomRangeChange,
  className
}: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    customRange?.start
      ? { from: customRange.start, to: customRange.end || undefined }
      : undefined
  );

  const hasActiveFilter = selectedFilter !== "all";

  const getFilterLabel = (): string => {
    if (selectedFilter === "custom" && customRange?.start) {
      if (
        customRange.end &&
        customRange.start.getTime() !== customRange.end.getTime()
      ) {
        return `${format(customRange.start, "MMM d")} - ${format(customRange.end, "MMM d")}`;
      }
      return format(customRange.start, "MMM d, yyyy");
    }
    const option = DATE_OPTIONS.find((o) => o.value === selectedFilter);
    return option?.label || "All dates";
  };

  const clearFilter = () => {
    onFilterChange("all");
    onCustomRangeChange?.({ start: null, end: null });
    setShowCustomPicker(false);
    setDateRange(undefined);
    setOpen(false);
  };

  const handleOptionClick = (value: DateFilterOption) => {
    if (value === "custom") {
      setShowCustomPicker(true);
      if (customRange?.start) {
        setDateRange({
          from: customRange.start,
          to: customRange.end || undefined
        });
      }
    } else {
      onFilterChange(value);
      onCustomRangeChange?.({ start: null, end: null });
      setShowCustomPicker(false);
      setOpen(false);
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const applyCustomRange = () => {
    if (dateRange?.from) {
      const start = dateRange.from;
      start.setHours(0, 0, 0, 0);
      const end = dateRange.to || dateRange.from;
      end.setHours(23, 59, 59, 999);
      onCustomRangeChange?.({ start, end });
      onFilterChange("custom");
      setShowCustomPicker(false);
      setOpen(false);
    }
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
              hasActiveFilter && "border-primary/50 text-white"
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">{getFilterLabel()}</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              {hasActiveFilter && (
                <X
                  className="w-3.5 h-3.5 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilter();
                  }}
                />
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-[#1a1d3a] border-white/10"
          align="start"
        >
          {!showCustomPicker ? (
            <div className="p-2 space-y-1">
              {DATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors cursor-pointer",
                    selectedFilter === option.value
                      ? "bg-primary/20 text-white"
                      : "text-white/70 hover:bg-white/5"
                  )}
                >
                  <span className="flex-1 text-left">{option.label}</span>
                  {selectedFilter === option.value && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="text-white/50 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white/80 text-sm font-medium">
                  Select date range
                </span>
              </div>

              <CalendarPicker
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                locale={enUS}
                numberOfMonths={1}
                initialFocus
              />

              <div className="flex gap-2 border-t border-white/10 p-4">
                <Button
                  variant="ghost"
                  className="flex-1 text-white/70"
                  onClick={() => {
                    setShowCustomPicker(false);
                    setDateRange(undefined);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary/80 hover:bg-primary text-white"
                  onClick={applyCustomRange}
                  disabled={!dateRange?.from}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export type { DateFilterOption, CustomDateRange };

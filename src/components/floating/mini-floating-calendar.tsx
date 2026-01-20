import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Expand, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarDayData, CalendarModule, CALENDAR_VIEW_CONFIGS } from "@/types/calendar.types";
import { FloatingContainer } from "./floating-container";
import { ExpandedCalendarView } from "./calendar-views";
import { WidgetPosition } from "@/types/widget.types";

interface MiniFloatingCalendarProps {
  isVisible: boolean;
  isPinned: boolean;
  isExpanded?: boolean;
  position: WidgetPosition;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleExpand?: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activeModule: CalendarModule;
  getDayData?: (date: string) => CalendarDayData | undefined;
  stackIndex?: number;
}

const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export function MiniFloatingCalendar({
  isVisible,
  isPinned,
  isExpanded = false,
  position,
  onClose,
  onTogglePin,
  onToggleExpand,
  onPositionChange,
  selectedDate,
  onSelectDate,
  activeModule,
  getDayData,
  stackIndex = 0
}: MiniFloatingCalendarProps) {
  const config = CALENDAR_VIEW_CONFIGS[activeModule];
  const [expandedOpen, setExpandedOpen] = useState(false);

  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, 1);
  });

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (string | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push(dateStr);
    }

    return days;
  }, [currentDate]);

  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(today);
  };

  const renderDayIndicator = (dayData: CalendarDayData | undefined) => {
    if (!dayData?.indicator || !config.showIndicators) return null;

    const { type, value, color } = dayData.indicator;

    switch (type) {
      case "mood":
      case "emoji":
        return (
          <span className="text-[8px] leading-none">{value}</span>
        );
      case "dot":
        return (
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: color || "var(--primary)" }}
          />
        );
      case "count":
        return (
          <span
            className="text-[8px] leading-none font-medium"
            style={{ color: color || "var(--primary)" }}
          >
            {value}
          </span>
        );
      case "progress":
        return (
          <div
            className="w-full h-0.5 rounded-full overflow-hidden bg-white/10"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Number(value)}%`,
                backgroundColor: color || "var(--primary)"
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <FloatingContainer
      title="Calendar"
      isVisible={isVisible}
      isPinned={isPinned}
      isExpanded={isExpanded}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onToggleExpand={onToggleExpand}
      onPositionChange={onPositionChange}
      stackIndex={stackIndex}
      className="w-56"
      showExpandButton={false}
    >
      <div className="p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white">{monthYear}</span>
            <button
              onClick={goToToday}
              className="px-1.5 py-0.5 text-[10px] text-primary hover:bg-primary/10 rounded transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS_SHORT.map((day, i) => (
            <div
              key={`${day}-${i}`}
              className="text-center text-[9px] text-white/40 font-medium py-0.5"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayData = getDayData?.(date);
            const isSelected = date === selectedDate;
            const isToday = date === today;
            const dayNumber = parseInt(date.split("-")[2]);

            return (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded text-[10px] transition-all relative gap-0.5",
                  isSelected
                    ? "bg-primary text-white"
                    : isToday
                      ? "bg-white/10 text-white font-medium"
                      : dayData?.hasData
                        ? "text-white/90 hover:bg-white/5"
                        : "text-white/40 hover:bg-white/5"
                )}
                title={dayData?.tooltip}
              >
                <span>{dayNumber}</span>
                {!isSelected && renderDayIndicator(dayData)}
              </button>
            );
          })}
        </div>

        {/* Module indicator & expand */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-white/40" />
            <span className="text-[10px] text-white/40 capitalize">{activeModule}</span>
          </div>
          <button
            onClick={() => setExpandedOpen(true)}
            className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Expanded view"
          >
            <Expand className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded Calendar View */}
      <ExpandedCalendarView
        open={expandedOpen}
        onOpenChange={setExpandedOpen}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        activeModule={activeModule}
      />
    </FloatingContainer>
  );
}

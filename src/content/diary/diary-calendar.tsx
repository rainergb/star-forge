import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMood } from "@/hooks/use-mood";
import { cn } from "@/lib/utils";

interface DayData {
  date: string;
  averageMood: number | null;
  entryCount: number;
}

interface DiaryCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  monthMoodData?: { month: string; days: DayData[] };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function DiaryCalendar({
  selectedDate,
  onSelectDate,
  monthMoodData
}: DiaryCalendarProps) {
  const { getColorForAverage, getEmojiForAverage } = useMood();

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
      month: "long",
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

  const getDayData = (date: string): DayData | undefined => {
    return monthMoodData?.days.find((d) => d.date === date);
  };

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

  return (
    <div className="w-full bg-background/30 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">{monthYear}</span>
          <button
            onClick={goToToday}
            className="px-2 py-0.5 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded transition-colors"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-white/40 font-medium py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayData = getDayData(date);
          const isSelected = date === selectedDate;
          const isToday = date === today;
          const dayNumber = parseInt(date.split("-")[2]);
          const moodEmoji = dayData?.averageMood
            ? getEmojiForAverage(dayData.averageMood)
            : null;
          const moodColor = dayData?.averageMood
            ? getColorForAverage(dayData.averageMood)
            : "transparent";

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all relative",
                isSelected
                  ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : isToday
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/70 hover:bg-white/5"
              )}
              style={{
                backgroundColor:
                  !isSelected && dayData?.averageMood
                    ? `${moodColor}20`
                    : undefined
              }}
            >
              <span>{dayNumber}</span>
              {moodEmoji && !isSelected && (
                <span className="text-[10px] leading-none mt-0.5">
                  {moodEmoji}
                </span>
              )}
              {dayData && dayData.entryCount > 0 && !moodEmoji && (
                <div
                  className={cn(
                    "w-1 h-1 rounded-full mt-0.5",
                    isSelected ? "bg-white" : "bg-primary"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

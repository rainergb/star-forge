import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Tag } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useDiary } from "@/hooks/use-diary";
import { useMood } from "@/hooks/use-mood";
import { ENTRY_TYPE_CONFIG } from "@/types/diary.types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiaryCalendarViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function DiaryCalendarView({
  selectedDate,
  onSelectDate
}: DiaryCalendarViewProps) {
  const { entries } = useDiary();
  const { getEmojiForAverage, getColorForAverage } = useMood();

  const [currentDate, setCurrentDate] = useState(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const goToPrevWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    onSelectDate(formatDateStr(now));
  };

  const getDayData = (dateStr: string) => {
    const dayEntries = entries.filter(e => e.date === dateStr);
    const moodsWithLevel = dayEntries.filter(e => e.mood?.level);
    const avgMood = moodsWithLevel.length > 0
      ? moodsWithLevel.reduce((sum, e) => sum + (e.mood?.level || 0), 0) / moodsWithLevel.length
      : null;

    return {
      entries: dayEntries,
      avgMood,
      moodEmoji: avgMood ? getEmojiForAverage(avgMood) : null,
      moodColor: avgMood ? getColorForAverage(avgMood) : null
    };
  };

  const selectedDayData = useMemo(() => {
    return getDayData(selectedDate);
  }, [selectedDate, entries]);

  // Week mood summary
  const weekMoodData = useMemo(() => {
    return weekDays.map(day => {
      const dateStr = formatDateStr(day);
      return { date: dateStr, ...getDayData(dateStr) };
    });
  }, [weekDays, entries]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Diary</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Week mood strip */}
        <div className="grid grid-cols-7 gap-2">
          {weekMoodData.map((dayData, index) => {
            const day = weekDays[index];
            const isSelected = dayData.date === selectedDate;
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dayData.date}
                onClick={() => onSelectDate(dayData.date)}
                className={cn(
                  "p-3 rounded-lg text-center transition-all",
                  isSelected
                    ? "bg-primary/20 ring-2 ring-primary"
                    : isToday
                      ? "bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                )}
              >
                <div className="text-xs text-white/40 mb-1">
                  {format(day, "EEE")}
                </div>
                <div className={cn(
                  "text-lg font-medium mb-2",
                  isToday && "text-primary"
                )}>
                  {day.getDate()}
                </div>
                {dayData.moodEmoji ? (
                  <div className="text-2xl">{dayData.moodEmoji}</div>
                ) : dayData.entries.length > 0 ? (
                  <div className="text-xs text-white/50">
                    {dayData.entries.length} entries
                  </div>
                ) : (
                  <div className="text-white/20 text-xs">—</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day entries */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {format(new Date(selectedDate.replace(/-/g, "/")), "EEEE, MMMM d")}
            </h3>
            {selectedDayData.moodEmoji && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedDayData.moodEmoji}</span>
                <span className="text-sm text-white/50">Average mood</span>
              </div>
            )}
          </div>

          {selectedDayData.entries.length > 0 ? (
            <div className="space-y-3">
              {selectedDayData.entries.map(entry => {
                const typeConfig = ENTRY_TYPE_CONFIG[entry.type];

                return (
                  <div
                    key={entry.id}
                    className="bg-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{typeConfig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white/50">
                            {entry.time || typeConfig.label}
                          </span>
                          {entry.mood?.emoji && (
                            <span>{entry.mood.emoji}</span>
                          )}
                          {entry.favorite && (
                            <span className="text-yellow-400">★</span>
                          )}
                        </div>
                        <p className="text-white/80">{entry.content}</p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Tag className="w-3 h-3 text-white/40" />
                            {entry.tags.map(tag => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-white/40 py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No entries for this day</p>
              <p className="text-sm mt-1">Write something in your diary!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary footer */}
      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            {weekMoodData.reduce((sum, d) => sum + d.entries.length, 0)} entries this week
          </span>
          <span>
            {weekMoodData.filter(d => d.moodEmoji).length} days with mood
          </span>
        </div>
      </div>
    </div>
  );
}

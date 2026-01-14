import { useState } from "react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Clock, Sun, Calendar, CalendarDays, ChevronLeft } from "lucide-react";
import { TaskReminder } from "@/types/task.types";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface ReminderMenuProps {
  onSelect: (reminder: TaskReminder) => void;
  onClose: () => void;
}

export function ReminderMenu({ onSelect, onClose }: ReminderMenuProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  });
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");

  const getTodayReminder = (): TaskReminder => {
    const now = new Date();
    now.setHours(13, 0, 0, 0);
    return {
      date: now.getTime(),
      label: "Today at 1:00 PM"
    };
  };

  const getTomorrowReminder = (): TaskReminder => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dayName = tomorrow.toLocaleDateString("en-US", { weekday: "short" });
    return {
      date: tomorrow.getTime(),
      label: `Tomorrow, ${dayName}, 9:00 AM`
    };
  };

  const getNextWeekReminder = (): TaskReminder => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);
    const dayName = nextWeek.toLocaleDateString("en-US", { weekday: "short" });
    return {
      date: nextWeek.getTime(),
      label: `Next week, ${dayName}, 9:00 AM`
    };
  };

  const options = [
    {
      icon: <Clock className="w-4 h-4" />,
      label: "Later today",
      time: "1:00 PM",
      getReminder: getTodayReminder
    },
    {
      icon: <Sun className="w-4 h-4" />,
      label: "Tomorrow",
      time:
        new Date(Date.now() + 86400000).toLocaleDateString("en-US", {
          weekday: "short"
        }) + ", 9:00 AM",
      getReminder: getTomorrowReminder
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      label: "Next week",
      time:
        new Date(Date.now() + 7 * 86400000).toLocaleDateString("en-US", {
          weekday: "short"
        }) + ", 9:00 AM",
      getReminder: getNextWeekReminder
    }
  ];

  const formatCustomLabel = (date: Date): string => {
    return format(date, "EEE, MMM d, HH:mm", { locale: enUS });
  };

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const numValue = parseInt(value) || 0;

    if (type === "hours") {
      const clamped = Math.min(23, Math.max(0, numValue))
        .toString()
        .padStart(2, "0");
      setHours(clamped);
    } else {
      const clamped = Math.min(59, Math.max(0, numValue))
        .toString()
        .padStart(2, "0");
      setMinutes(clamped);
    }
  };

  const handleCustomSave = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hours), parseInt(minutes));
      onSelect({
        date: finalDate.getTime(),
        label: formatCustomLabel(finalDate)
      });
    }
  };

  if (showCustomPicker) {
    return (
      <>
        <div className="fixed inset-0 z-10" onClick={onClose} />
        <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <button
              onClick={() => setShowCustomPicker(false)}
              className="text-white/50 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white/80 text-sm font-medium">
              Choose date and time
            </span>
          </div>

          <CalendarPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={enUS}
            initialFocus
          />

          <div className="flex items-center justify-center gap-2 border-t border-white/10 py-4 px-4">
            <input
              type="text"
              value={hours}
              onChange={(e) => handleTimeChange("hours", e.target.value)}
              className="w-12 h-10 text-center bg-white/5 border border-white/10 rounded-md text-white text-lg focus:outline-none focus:border-primary/50"
              maxLength={2}
            />
            <span className="text-white/50 text-lg">:</span>
            <input
              type="text"
              value={minutes}
              onChange={(e) => handleTimeChange("minutes", e.target.value)}
              className="w-12 h-10 text-center bg-white/5 border border-white/10 rounded-md text-white text-lg focus:outline-none focus:border-primary/50"
              maxLength={2}
            />
          </div>

          <div className="flex gap-2 border-t border-white/10 p-4">
            <Button
              variant="ghost"
              className="flex-1 text-white/70"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary/80 hover:bg-primary text-white"
              onClick={handleCustomSave}
              disabled={!selectedDate}
            >
              Save
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute left-0 top-full mt-1 w-64 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.getReminder())}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer text-left"
          >
            <span className="text-white/50">{option.icon}</span>
            <span className="flex-1 text-white/80 text-sm">{option.label}</span>
            <span className="text-white/40 text-xs">{option.time}</span>
          </button>
        ))}
        <button
          onClick={() => setShowCustomPicker(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer text-left border-t border-white/10"
        >
          <CalendarDays className="w-4 h-4 text-white/50" />
          <span className="text-white/80 text-sm">Choose date and time</span>
        </button>
      </div>
    </>
  );
}

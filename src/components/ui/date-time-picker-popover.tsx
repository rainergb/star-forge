import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface DateTimePickerPopoverProps {
  title: string;
  initialDate?: Date;
  onSave: (date: Date) => void;
  onClose: () => void;
  showTime?: boolean;
}

export function DateTimePickerPopover({
  title,
  initialDate,
  onSave,
  onClose,
  showTime = true
}: DateTimePickerPopoverProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [hours, setHours] = useState(
    initialDate ? initialDate.getHours().toString().padStart(2, "0") : "12"
  );
  const [minutes, setMinutes] = useState(
    initialDate ? initialDate.getMinutes().toString().padStart(2, "0") : "00"
  );

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const numValue = parseInt(value) || 0;
    if (type === "hours") {
      const clamped = Math.min(23, Math.max(0, numValue)).toString().padStart(2, "0");
      setHours(clamped);
    } else {
      const clamped = Math.min(59, Math.max(0, numValue)).toString().padStart(2, "0");
      setMinutes(clamped);
    }
  };

  const handleSave = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(parseInt(hours), parseInt(minutes));
      onSave(finalDate);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white/80 text-sm font-medium">{title}</span>
        </div>
        
        <CalendarPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={ptBR}
          initialFocus
        />

        {showTime && (
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
        )}
          
        <div className="flex gap-2 border-t border-white/10 p-4">
          <Button
            variant="ghost"
            className="flex-1 text-white/70"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-primary/80 hover:bg-primary text-white"
            onClick={handleSave}
            disabled={!selectedDate}
          >
            Salvar
          </Button>
        </div>
      </div>
    </>
  );
}

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  onConfirm: () => void
  onCancel: () => void
}

export function DateTimePicker({
  date,
  onDateChange,
  onConfirm,
  onCancel,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [hours, setHours] = React.useState(date ? date.getHours().toString().padStart(2, "0") : "12")
  const [minutes, setMinutes] = React.useState(date ? date.getMinutes().toString().padStart(2, "0") : "00")

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const updated = new Date(newDate)
      updated.setHours(parseInt(hours), parseInt(minutes))
      setSelectedDate(updated)
      onDateChange(updated)
    }
  }

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const numValue = parseInt(value) || 0
    
    if (type === "hours") {
      const clampedHours = Math.min(23, Math.max(0, numValue)).toString().padStart(2, "0")
      setHours(clampedHours)
      if (selectedDate) {
        const updated = new Date(selectedDate)
        updated.setHours(parseInt(clampedHours), parseInt(minutes))
        onDateChange(updated)
      }
    } else {
      const clampedMinutes = Math.min(59, Math.max(0, numValue)).toString().padStart(2, "0")
      setMinutes(clampedMinutes)
      if (selectedDate) {
        const updated = new Date(selectedDate)
        updated.setHours(parseInt(hours), parseInt(clampedMinutes))
        onDateChange(updated)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        locale={ptBR}
        initialFocus
      />
      
      <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-4">
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

      <div className="flex gap-2 border-t border-white/10 pt-4">
        <Button
          variant="ghost"
          className="flex-1 text-white/70"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          className="flex-1 bg-primary/80 hover:bg-primary text-white"
          onClick={onConfirm}
          disabled={!selectedDate}
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}

interface DateTimePickerButtonProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateTimePickerButton({
  date,
  onDateChange,
  placeholder = "Selecionar data e hora",
  className,
}: DateTimePickerButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date)

  const handleConfirm = () => {
    onDateChange(tempDate)
    setOpen(false)
  }

  const handleCancel = () => {
    setTempDate(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-white/40",
            className
          )}
        >
          <CalendarDays className="mr-2 h-4 w-4 text-white/50" />
          {date ? (
            format(date, "PPP 'às' HH:mm", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DateTimePicker
          date={tempDate}
          onDateChange={setTempDate}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </PopoverContent>
    </Popover>
  )
}

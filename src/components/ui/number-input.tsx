import * as React from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({ 
  value, 
  onChange, 
  min = 0, 
  max = 999, 
  step = 1,
  className,
  ...props 
}: NumberInputProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value)
          if (!isNaN(newValue)) {
            onChange(newValue)
          }
        }}
        className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/10">
        <button
          type="button"
          onClick={handleIncrement}
          className="flex-1 px-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors border-b border-white/10 flex items-center justify-center rounded-tr-md"
          tabIndex={-1}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={handleDecrement}
          className="flex-1 px-2 hover:bg-white/5 text-white/50 hover:text-white transition-colors flex items-center justify-center rounded-br-md"
          tabIndex={-1}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

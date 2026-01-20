import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  actions?: ReactNode;
  className?: string;
  /** Show actions even when input is empty */
  alwaysShowActions?: boolean;
}

export function ListInput({
  placeholder,
  onSubmit,
  actions,
  className,
  alwaysShowActions = false
}: ListInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const showActions = alwaysShowActions || value.trim();

  return (
    <div className={cn("w-full relative", className)}>
      <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
        {showActions && actions}
      </div>
    </div>
  );
}

// Controlled version for more complex use cases
interface ControlledListInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  actions?: ReactNode;
  className?: string;
  alwaysShowActions?: boolean;
}

export function ControlledListInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  actions,
  className,
  alwaysShowActions = false
}: ControlledListInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const showActions = alwaysShowActions || value.trim();

  return (
    <div className={cn("w-full relative", className)}>
      <div className="w-full flex items-center gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
        />
        {showActions && actions}
      </div>
    </div>
  );
}

// Color picker action button for inputs
interface ColorPickerActionProps<T extends string> {
  selectedColor: T;
  onColorChange: (color: T) => void;
  colors: T[];
  getColorStyle: (color: T) => string;
}

export function ColorPickerAction<T extends string>({
  selectedColor,
  onColorChange,
  colors,
  getColorStyle
}: ColorPickerActionProps<T>) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-1.5 rounded-md transition-colors cursor-pointer hover:bg-white/5"
        title="Choose color"
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: getColorStyle(selectedColor) }}
        />
      </button>

      {showPicker && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg p-2 z-20 grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  onColorChange(color);
                  setShowPicker(false);
                }}
                className={cn(
                  "w-6 h-6 rounded-full transition-transform hover:scale-110",
                  selectedColor === color && "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d3a]"
                )}
                style={{ backgroundColor: getColorStyle(color) }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

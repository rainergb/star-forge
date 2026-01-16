import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorOption<T extends string> {
  value: T;
  label: string;
}

interface ColorPickerMenuProps<T extends string> {
  value: T;
  onChange: (color: T) => void;
  colors: Record<T, { solid: string }>;
  options: ColorOption<T>[];
  className?: string;
}

export function ColorPickerMenu<T extends string>({
  value,
  onChange,
  colors,
  options,
  className
}: ColorPickerMenuProps<T>) {
  const [showMenu, setShowMenu] = useState(false);

  const selectedOption = options.find((c) => c.value === value);

  const handleSelect = (newColor: T) => {
    onChange(newColor);
    setShowMenu(false);
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 px-2 py-3 hover:bg-white/5 rounded-lg cursor-pointer text-left"
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: colors[value].solid }}
        />
        <span className="text-white/70 text-sm">
          {selectedOption?.label || "Color"}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 bg-[#1a1d3a] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden min-w-[180px]">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors cursor-pointer",
                    value === option.value
                      ? "text-primary bg-primary/10"
                      : "text-white/70 hover:bg-white/5"
                  )}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[option.value].solid }}
                  />
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Opções de cores padrão (reutilizáveis)
export const DEFAULT_COLOR_OPTIONS = [
  { value: "purple", label: "Purple" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "pink", label: "Pink" },
  { value: "cyan", label: "Cyan" },
  { value: "yellow", label: "Yellow" }
] as const;

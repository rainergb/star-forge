import { useState, useRef, forwardRef, ReactNode, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ListInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  actions?: ReactNode;
  /** Content rendered outside the input container but positioned relative to it (popovers, menus) */
  popoverContent?: ReactNode;
  className?: string;
  /** Show actions even when input is empty */
  alwaysShowActions?: boolean;
}

export function ListInput({
  placeholder,
  onSubmit,
  actions,
  popoverContent,
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
      {popoverContent}
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
  /** Content rendered outside the input container but positioned relative to it (popovers, menus) */
  popoverContent?: ReactNode;
  className?: string;
  alwaysShowActions?: boolean;
  /** Enable multi-line input that expands as user types (Shift+Enter for new line) */
  expandable?: boolean;
  /** Max height when expandable (default 120px) */
  maxHeight?: number;
}

export const ControlledListInput = forwardRef<
  HTMLDivElement,
  ControlledListInputProps
>(function ControlledListInput(
  {
    value,
    onChange,
    onSubmit,
    placeholder,
    actions,
    popoverContent,
    className,
    alwaysShowActions = false,
    expandable = false,
    maxHeight = 120
  },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [maxHeight]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    // Shift+Enter allows new line (default behavior)
  };

  const showActions = alwaysShowActions || value.trim();

  return (
    <div ref={ref} className={cn("w-full relative", className)}>
      <div
        className={cn(
          "w-full flex gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors",
          expandable ? "items-start" : "items-center"
        )}
      >
        {expandable ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleTextareaKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none resize-none min-h-6 leading-6 overflow-y-auto scrollbar-none"
            style={{ maxHeight: `${maxHeight}px` }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none"
          />
        )}
        {showActions && actions}
      </div>
      {popoverContent}
    </div>
  );
});

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
                  selectedColor === color &&
                    "ring-2 ring-white ring-offset-2 ring-offset-[#1a1d3a]"
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

// Textarea variant for multi-line inputs (like diary entries)
interface TextareaListInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** Content rendered to the right of the textarea (e.g., submit button) */
  inputRight?: ReactNode;
  /** Content rendered in the footer section inside the container */
  footer?: ReactNode;
  /** Expandable content rendered at the bottom inside the container */
  expandableContent?: ReactNode;
  /** Whether submit is disabled */
  submitDisabled?: boolean;
  className?: string;
  maxHeight?: number;
}

export const TextareaListInput = forwardRef<
  HTMLDivElement,
  TextareaListInputProps
>(function TextareaListInput(
  {
    value,
    onChange,
    onSubmit,
    placeholder,
    inputRight,
    footer,
    expandableContent,
    submitDisabled = false,
    className,
    maxHeight = 120
  },
  ref
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [maxHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!submitDisabled) {
        onSubmit();
      }
    }
  };

  return (
    <div ref={ref} className={cn("w-full relative", className)}>
      <div className="w-full flex flex-col gap-2 px-4 py-3 bg-background/50 border border-white/10 rounded-lg focus-within:border-primary/50 transition-colors">
        <div className="flex items-start gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none resize-none min-h-6"
            style={{ maxHeight: `${maxHeight}px` }}
          />
          {inputRight}
        </div>

        {footer && <div className="pt-1 border-t border-white/5">{footer}</div>}

        {expandableContent}
      </div>
    </div>
  );
});

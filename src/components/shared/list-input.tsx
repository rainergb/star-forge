import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ListInputProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  actions?: ReactNode;
  className?: string;
}

export function ListInput({
  placeholder,
  onSubmit,
  actions,
  className
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
        {value.trim() && actions}
      </div>
    </div>
  );
}

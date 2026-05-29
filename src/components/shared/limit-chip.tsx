import { useState, useEffect, useRef } from "react";
import { Hash, ChevronDown } from "lucide-react";
import { LimitValue } from "@/hooks/use-list-limit";

export const LIMIT_OPTIONS: LimitValue[] = [10, 20, 50, 100, null];

interface LimitChipProps {
  value: LimitValue;
  onChange: (value: LimitValue) => void;
  /** Quantidade real exibida — opcional, aparece como sufixo (ex: "20/45") */
  totalCount?: number;
}

export function LimitChip({ value, onChange, totalCount }: LimitChipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const label = value === null ? "All" : String(value);
  const suffix =
    totalCount !== undefined && value !== null && totalCount > value
      ? `/${totalCount}`
      : "";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer bg-white/5 text-white/50 border border-white/10 hover:text-white/80 hover:bg-white/10"
        title="Items shown"
      >
        <Hash className="w-3 h-3" />
        <span>
          {label}
          {suffix}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 bg-surface border border-white/10 rounded-lg shadow-xl z-50 min-w-[80px] py-1 backdrop-blur-xl">
          {LIMIT_OPTIONS.map((opt) => {
            const optLabel = opt === null ? "All" : String(opt);
            const isActive = opt === value;
            return (
              <button
                key={opt ?? "all"}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {optLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Aplica o limite a uma lista (null = todos) */
export function applyLimit<T>(list: T[], limit: LimitValue): T[] {
  if (limit === null) return list;
  return list.slice(0, limit);
}

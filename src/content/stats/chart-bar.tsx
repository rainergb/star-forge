import { useState } from "react";

interface ChartBarProps {
  item: { label: string; value: number; sessions: number };
  maxMinutes: number;
}

export function ChartBar({ item, maxMinutes }: ChartBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className="flex-1 flex flex-col items-center gap-2 relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a1d3a] border border-white/20 rounded-lg px-3 py-2 shadow-xl z-10 whitespace-nowrap">
          <div className="text-xs text-white/90 font-medium">{item.label}</div>
          <div className="text-xs text-white/60 mt-1">
            <span className="text-primary">{item.value}m</span> •{" "}
            {item.sessions} sessions
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-[#1a1d3a] border-r border-b border-white/20 transform rotate-45" />
          </div>
        </div>
      )}
      <div className="w-full flex flex-col items-center justify-end h-24 cursor-pointer">
        <div
          className="w-full bg-primary/60 hover:bg-primary/80 rounded-t transition-all duration-300 min-h-1"
          style={{
            height: `${(item.value / maxMinutes) * 100}%`
          }}
        />
      </div>
      <span className="text-xs text-white/50">{item.label}</span>
    </div>
  );
}

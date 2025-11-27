import { Play, Pause, Square, Coffee, Brain } from "lucide-react";

interface TimerControlsProps {
  isActive: boolean;
  isWorkMode: boolean;
  hasStarted: boolean;
  onToggle: () => void;
  onReset: () => void;
  onRest: () => void;
  onWork: () => void;
}

export function TimerControls({
  isActive,
  isWorkMode,
  hasStarted,
  onToggle,
  onReset,
  onRest,
  onWork
}: TimerControlsProps) {
  const buttons = [
    {
      onClick: isWorkMode ? onRest : onWork,
      title: isWorkMode ? "Break" : "Work",
      icon: isWorkMode ? <Coffee size={35} /> : <Brain size={35} />,
      disabled: !hasStarted
    },
    {
      onClick: onToggle,
      title: isActive ? "Pause" : "Play",
      icon: isActive ? <Pause size={35} /> : <Play size={35} />,
      disabled: false
    },
    {
      onClick: onReset,
      title: "Reset",
      icon: <Square size={35} />,
      disabled: !hasStarted
    }
  ];

  return (
    <div className="flex gap-10">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          disabled={btn.disabled}
          title={btn.title}
          className={`cursor-pointer rounded-lg flex items-center gap-2 px-4 py-2 bg-[#0b0d27]/50 border  text-text transition-colors ${
            btn.disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/10"
          }`}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

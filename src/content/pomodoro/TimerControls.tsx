import { Play, Pause, Square, Coffee } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onRest: () => void;
}

export function TimerControls({
  isActive,
  onToggle,
  onReset,
  onRest
}: TimerControlsProps) {
  const buttons = [
    {
      onClick: onRest,
      title: "Break",
      icon: <Coffee size={35} />
    },
    {
      onClick: onToggle,
      title: isActive ? "Pause" : "Play",
      icon: isActive ? <Pause size={35} /> : <Play size={35} />
    },
    {
      onClick: onReset,
      title: "Reset",
      icon: <Square size={35} />
    }
  ];

  return (
    <div className="flex gap-10">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          title={btn.title}
          className="cursor-pointer rounded-lg flex items-center gap-2 px-4 py-2 bg-surface border border-primary/50 hover:bg-primary/10 text-text transition-colors"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

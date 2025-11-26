import { Play, Pause, Square, Coffee } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  onRest: () => void;
}

export function TimerControls({ isActive, onToggle, onReset, onRest }: TimerControlsProps) {
  const buttons = [
    {
      onClick: onRest,
      title: "Break",
      icon: <Coffee size={20} />
    },
    {
      onClick: onToggle,
      title: isActive ? "Pause" : "Play",
      icon: isActive ? <Pause size={20} /> : <Play size={20} />
    },
    {
      onClick: onReset,
      title: "Reset",
      icon: <Square size={20} />
    },
  ];

  return (
    <div className="flex gap-3">
      {buttons.map((btn, index) => (
        <button
          key={index}
          onClick={btn.onClick}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-primary/50 hover:bg-primary/10 text-text rounded-lg transition-colors cursor-pointer"
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
    </div>
  );
}

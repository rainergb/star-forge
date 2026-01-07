interface MiniCycleStarProps {
  index: number;
}

const positions = [
  { x: 20, y: 30 },
  { x: 70, y: 25 },
  { x: 45, y: 60 },
  { x: 15, y: 70 },
  { x: 80, y: 65 },
  { x: 35, y: 20 },
  { x: 60, y: 75 },
  { x: 25, y: 50 },
  { x: 75, y: 45 },
  { x: 50, y: 35 },
  { x: 10, y: 40 },
  { x: 85, y: 30 },
  { x: 40, y: 80 },
  { x: 65, y: 15 },
  { x: 30, y: 85 },
];

export function MiniCycleStar({ index }: MiniCycleStarProps) {
  const pos = positions[index % positions.length];
  const animationDelay = (index * 0.3) % 3;
  const floatDuration = 3 + (index % 3);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        animation: `float ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${animationDelay}s`
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-6 h-6 bg-primary/30 rounded-full blur-lg" />
        <div className="absolute w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,1)] z-20" />
        <div className="absolute w-4 h-px bg-linear-to-r from-transparent via-white to-transparent opacity-80" />
        <div className="absolute w-px h-4 bg-linear-to-b from-transparent via-white to-transparent opacity-80" />
        <div className="absolute w-2 h-px bg-linear-to-r from-transparent via-white/50 to-transparent rotate-45" />
        <div className="absolute w-px h-2 bg-linear-to-b from-transparent via-white/50 to-transparent rotate-45" />
        <div className="absolute w-2 h-2 bg-primary/40 rounded-full blur-sm" />
      </div>
    </div>
  );
}

interface CycleStarProps {
  index: number;
  radius?: number;
}

export function CycleStar({ index, radius = 260 }: CycleStarProps) {
  const startAngle = -90;
  const spacing = 10;

  let offset = 0;
  if (index > 0) {
    const pairIndex = Math.ceil(index / 2);
    const direction = index % 2 === 1 ? 1 : -1;
    offset = pairIndex * spacing * direction;
  }

  const angle = startAngle + offset;
  const angleRad = (angle * Math.PI) / 180;

  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  return (
    <div
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
      }}
    >
      <div className="relative flex items-center justify-center animate-in fade-in zoom-in duration-900">
        {/* Outer Blur */}
        <div className="absolute w-12 h-12 bg-primary/30 rounded-full blur-xl" />

        {/* Center Core */}
        <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] z-20" />

        {/* Horizontal Ray */}
        <div className="absolute w-8 h-px bg-linear-to-r from-transparent via-white to-transparent opacity-80" />

        {/* Vertical Ray */}
        <div className="absolute w-px h-8 bg-linear-to-b from-transparent via-white to-transparent opacity-80" />

        {/* Diagonal Rays (smaller) */}
        <div className="absolute w-4 h-px bg-linear-to-r from-transparent via-white/50 to-transparent rotate-45" />
        <div className="absolute w-px h-4 bg-linear-to-b from-transparent via-white/50 to-transparent rotate-45" />

        {/* Glow */}
        <div className="absolute w-4 h-4 bg-primary/40 rounded-full blur-md" />
      </div>
    </div>
  );
}

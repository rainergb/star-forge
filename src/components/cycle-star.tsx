interface CycleStarProps {
  index: number;
  radius?: number;
}

export function CycleStar({ index, radius = 260 }: CycleStarProps) {
  // Start from top (-90 degrees)
  // Place stars every 30 degrees
  const angleStep = 30;
  const startAngle = -90;
  const angle = startAngle + (index * angleStep);
  const angleRad = (angle * Math.PI) / 180;
  
  const x = Math.cos(angleRad) * radius;
  const y = Math.sin(angleRad) * radius;

  return (
    <div 
      className="absolute top-1/2 left-1/2 pointer-events-none"
      style={{
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
      }}
    >
      <div className="relative flex items-center justify-center animate-in fade-in zoom-in duration-700">
        {/* Core */}
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] z-10 blur-xs" />
        {/* Inner Glow */}
        <div className="absolute w-2 h-2 bg-primary/60 rounded-full blur-[3px]" />
        {/* Outer Glow */}
        <div className="absolute w-2 h-2 bg-primary/30 rounded-full blur-md" />
      </div>
    </div>
  );
}

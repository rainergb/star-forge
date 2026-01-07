import { Star } from "lucide-react";
import { MiniCycleStar } from "./mini-cycle-star";

interface CycleStarsAquariumProps {
  cycleStars: number;
}

export function CycleStarsAquarium({ cycleStars }: CycleStarsAquariumProps) {
  if (cycleStars <= 0) return null;

  return (
    <div className="bg-background/50 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/60">
          <Star className="w-4 h-4" />
          <span className="text-sm">Cycle Stars Collected</span>
        </div>
        <span className="text-sm text-white/50">{cycleStars} stars</span>
      </div>
      <div className="relative h-24 rounded-lg overflow-hidden">
        {Array.from({ length: cycleStars }).map((_, i) => (
          <MiniCycleStar key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Orb from "@/components/orb";
import { CycleStar } from "@/components/cycle-star";
import Particles from "@/components/particles";
import { TimerControls } from "./TimerControls";

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  const [completedCycles, setCompletedCycles] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (isWorkMode) {
        setCompletedCycles((prev) => prev + 1);
        setIsWorkMode(false);
        setTimeLeft(1);
      } else {
        setIsWorkMode(true);
        setTimeLeft(1);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWorkMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setCompletedCycles(0);
    setTimeLeft(1);
  };

  const startRest = () => {
    setIsActive(false);
    setIsWorkMode(false);
    setTimeLeft(1);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-20 w-full max-w-2xl mx-auto">
      <div className="bg-surface/93 rounded-full shadow-lg border-5 border-b-background-secondary flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(106,48,255,0.2)]">
        <div className="relative w-110 h-110 rounded-full flex items-center justify-center">
          {Array.from({ length: completedCycles }).map((_, i) => (
            <CycleStar key={i} index={i} />
          ))}

          <div className="absolute inset-0 pointer-events-none">
            <Orb
              hoverIntensity={10}
              rotateOnHover={true}
              hue={isActive ? 0 : 200}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <Particles
              particleCount={completedCycles * 30}
              particleSpread={10}
              speed={0.1}
              particleColors={["#6A30FF", "#D6B8FF", "#ffffff"]}
              moveParticlesOnHover={false}
              alphaParticles={true}
              particleBaseSize={100}
              sizeRandomness={1}
              cameraDistance={20}
              disableRotation={false}
              className="w-full h-full"
            />
          </div>

          <div className="text-7xl font-mono font-bold text-text z-10 tabular-nums drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <TimerControls
        isActive={isActive}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onRest={startRest}
      />
    </div>
  );
}

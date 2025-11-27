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
  const [hasStarted, setHasStarted] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);

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
        setTimeLeft(isTestMode ? 1 : 5 * 60);
      } else {
        setIsWorkMode(true);
        setTimeLeft(isTestMode ? 1 : 25 * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isWorkMode, isTestMode]);

  const toggleTimer = () => {
    if (!isActive && isWorkMode) {
      setHasStarted(true);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setCompletedCycles(0);
    setHasStarted(false);
    setTimeLeft(isTestMode ? 1 : 25 * 60);
  };

  const startRest = () => {
    setIsActive(false);
    setIsWorkMode(false);
    setTimeLeft(isTestMode ? 1 : 5 * 60);
    setIsActive(true);
  };

  const startWork = () => {
    setIsActive(false);
    setIsWorkMode(true);
    setHasStarted(true);
    setTimeLeft(isTestMode ? 1 : 25 * 60);
    setIsActive(true);
  };

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
    if (!isTestMode) {
      setTimeLeft(1);
    } else {
      setTimeLeft(isWorkMode ? 25 * 60 : 5 * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-15 w-full max-w-2xl mx-auto">
      <button
        onClick={toggleTestMode}
        className={`mt-4 px-4 py-2 rounded text-xs font-mono transition-colors ${
          isTestMode
            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
            : "bg-white/5 text-white/30 hover:text-white hover:bg-white/10"
        }`}
      >
        {isTestMode ? "TEST MODE ON (1s)" : "TEST MODE OFF"}
      </button>

      <div className="bg-[#0b0d27]/80 rounded-full shadow-lg  flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(106,48,255,0.2)]">
        <div className="relative w-110 h-110 rounded-full flex items-center justify-center">
          {Array.from({ length: completedCycles }).map((_, i) => (
            <CycleStar key={i} index={i} />
          ))}

          <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
              hasStarted ? "opacity-100" : "opacity-0"
            }`}
          >
            <Orb
              hoverIntensity={10}
              rotateOnHover={true}
              hue={isWorkMode ? 0 : 45}
              paused={!isActive}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <Particles
              particleCount={completedCycles * 30}
              particleSpread={10}
              speed={0.1}
              particleColors={
                isWorkMode
                  ? ["#6A30FF", "#D6B8FF", "#ffffff"]
                  : ["#FFD700", "#FFA500", "#ffffff"]
              }
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
        isWorkMode={isWorkMode}
        hasStarted={hasStarted}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onRest={startRest}
        onWork={startWork}
      />
    </div>
  );
}

import { usePomodoroContext } from "@/context/pomodoro-context";
import { usePersonalize } from "@/hooks/use-personalize";
import Orb from "@/components/orb";
import { CycleStar } from "@/components/cycle-star";
import Particles from "@/components/particles";
import { TimerControls } from "./timer-controls";

export function PomodoroTimer() {
  const { settings } = usePersonalize();
  const {
    timeLeft,
    isActive,
    completedCycles,
    hasStarted,
    isTestMode,
    mode,
    toggleTimer,
    resetTimer,
    startBreak,
    startWork,
    toggleTestMode,
    formatTime,
    isWorkMode
  } = usePomodoroContext();


  const getHue = () => {
    if (mode === "work") return 0;
    if (mode === "longBreak") return 120;
    return 45;
  };

  const getParticleColors = () => {
    if (mode === "work") return ["#6A30FF", "#D6B8FF", "#ffffff"];
    if (mode === "longBreak") return ["#00FF00", "#90EE90", "#ffffff"];
    return ["#FFD700", "#FFA500", "#ffffff"];
  };

  return (
    <div className="flex flex-col items-center gap-15 w-full max-w-2xl mx-auto">
      {settings.showTest && (
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
      )}

      <div
        onClick={toggleTimer}
        className="bg-background/80 rounded-full shadow-lg border-2 cursor-pointer flex flex-col items-center justify-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(106,48,255,0.2)]"
      >
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
              hue={getHue()}
              paused={!isActive}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
            <Particles
              particleCount={completedCycles * 30}
              particleSpread={10}
              speed={0.1}
              particleColors={getParticleColors()}
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
        onRest={startBreak}
        onWork={startWork}
      />
    </div>
  );
}

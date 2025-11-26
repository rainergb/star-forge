import { useState, useEffect } from 'react';
import Orb from '../../components/orb';
import { TimerControls } from './TimerControls';

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const startRest = () => {
    setIsActive(false);
    setTimeLeft(5 * 60);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-surface p-6 rounded-xl shadow-lg border border-primary/20 flex flex-col items-center gap-4 w-full max-w-md mx-auto transition-all duration-300 hover:shadow-[0_0_30px_rgba(106,48,255,0.2)]">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <Orb hoverIntensity={0.5} rotateOnHover={true} hue={isActive ? 0 : 200} />
        </div>
        <div className="text-5xl font-mono font-bold text-text z-10 tabular-nums drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
          {formatTime(timeLeft)}
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

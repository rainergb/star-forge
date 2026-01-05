import { Play, Pause, Square, SkipForward, Coffee, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FloatingContainer } from "./floating-container";
import { PomodoroTimer } from "@/content/pomodoro/pomodoro-timer";
import { useActiveTask } from "@/hooks/use-active-task";
import { useTasks } from "@/hooks/use-tasks";
import { WidgetPosition } from "@/types/widget.types";

interface MiniPomodoroProps {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
  timeLeft: number;
  isActive: boolean;
  isWorkMode: boolean;
  hasStarted: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  onPositionChange: (position: WidgetPosition) => void;
  onToggle: () => void;
  onReset: () => void;
  onSkip: () => void;
  stackIndex?: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function MiniPomodoro({
  isVisible,
  isPinned,
  position,
  timeLeft,
  isActive,
  isWorkMode,
  hasStarted,
  onClose,
  onTogglePin,
  onPositionChange,
  onToggle,
  onReset,
  onSkip,
  stackIndex
}: MiniPomodoroProps) {
  const { activeTask } = useActiveTask();
  const { getTask } = useTasks();

  const fullTask = activeTask ? getTask(activeTask.id) : null;

  if (!isVisible) return null;

  const progress = isWorkMode
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  // Renderiza PomodoroTimer completo quando fixado
  if (isPinned) {
    return (
      <FloatingContainer
        title="Pomodoro"
        isVisible={isVisible}
        isPinned={isPinned}
        position={position}
        onClose={onClose}
        onTogglePin={onTogglePin}
        onPositionChange={onPositionChange}
        expandedClassName="w-[420px] max-h-[calc(100vh-120px)]"
        stackIndex={stackIndex}
      >
        <div className="flex-1 overflow-y-auto scrollbar-none p-6">
          <PomodoroTimer />
        </div>
      </FloatingContainer>
    );
  }

  // Versão mini quando não fixado
  return (
    <FloatingContainer
      title="Pomodoro"
      isVisible={isVisible}
      isPinned={isPinned}
      position={position}
      onClose={onClose}
      onTogglePin={onTogglePin}
      onPositionChange={onPositionChange}
      className="w-64"
      stackIndex={stackIndex}
    >
      <div className="p-4 space-y-4">
        <div className="text-center">
          <div
            className={cn(
              "font-mono font-bold text-3xl",
              isWorkMode ? "text-primary" : "text-primary/70"
            )}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isWorkMode ? (
              <Brain className="h-4 w-4 text-primary" />
            ) : (
              <Coffee className="h-4 w-4 text-primary/70" />
            )}
            <span className="text-xs text-white/40">
              {isWorkMode ? "Focus" : "Break"}
            </span>
          </div>
        </div>

        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isWorkMode ? "bg-primary" : "bg-primary/70"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {fullTask && (
          <div className="bg-background/30 border border-white/10 rounded-lg px-3 py-2">
            <p className="text-xs text-white/40">Current task</p>
            <p className="text-sm font-medium text-white/90 truncate">{fullTask.title}</p>
            {fullTask.estimatedPomodoros && fullTask.estimatedPomodoros > 0 && (
              <div className="mt-1">
                <div className="flex items-center justify-between text-xs text-white/40 mb-1">
                  <span>Progress</span>
                  <span>
                    {fullTask.completedPomodoros ?? 0}/{fullTask.estimatedPomodoros}
                  </span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        ((fullTask.completedPomodoros ?? 0) /
                          fullTask.estimatedPomodoros) *
                          100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/60 hover:text-white/90 hover:bg-white/10 border border-white/10"
            onClick={onToggle}
          >
            {isActive ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/60 hover:text-white/90 hover:bg-white/10 border border-white/10 disabled:opacity-30"
            onClick={onReset}
            disabled={!hasStarted}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white/60 hover:text-white/90 hover:bg-white/10 border border-white/10"
            onClick={onSkip}
            disabled={!hasStarted}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </FloatingContainer>
  );
}

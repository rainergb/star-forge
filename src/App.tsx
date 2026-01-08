import { useState, useEffect } from 'react'
import { PomodoroTimer } from "@/content/pomodoro/pomodoro-timer";
import { PomodoroStats } from "@/content/stats";
import { TaskList } from "@/content/tasks/task-list";
import { ProjectList } from "@/content/projects/project-list";
import { TopBar } from "@/components/top-bar";
import { AppDock } from "@/content/dock/app-dock";
import { useToast } from "@/hooks/use-toast";
import { usePersonalize } from "@/hooks/use-personalize";
import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { useActiveTask } from "@/hooks/use-active-task";
import {
  PomodoroProvider,
  usePomodoroContext
} from "@/context/pomodoro-context";
import { MiniTaskList } from "@/components/floating/mini-task-list";
import { MiniPomodoro } from "@/components/floating/mini-pomodoro";
import { MiniMusicPlayer } from "@/components/floating/mini-music-player";
import { AppView } from "@/types/app.types";
import { Task } from "@/types/task.types";
import { WidgetPosition, WidgetType } from "@/types/widget.types";
import bgVideo from "@/assets/bg.mp4";

function AppContent() {
  const { toast } = useToast();
  const { settings } = usePersonalize();
  const { setActiveTask, clearActiveTask, activeTask } = useActiveTask();
  const {
    isVisible,
    isPinned,
    getPosition,
    setPosition,
    toggleVisibility,
    togglePin
  } = useFloatingWidgets();
  const {
    timeLeft,
    isActive,
    hasStarted,
    isWorkMode,
    toggleTimer,
    resetTimer,
    startBreak,
    formatTime
  } = usePomodoroContext();

  const [currentView, setCurrentView] = useState<AppView>("pomodoro");
  const [electronVersion, setElectronVersion] =
    useState<string>("Carregando...");

  const getStackIndex = (widget: WidgetType): number => {
    const widgets: WidgetType[] = [
      "miniTaskList",
      "miniPomodoro",
      "musicPlayer"
    ];
    const currentPosition = getPosition(widget);

    let index = 0;
    for (const w of widgets) {
      if (w === widget) break;
      if (isVisible(w) && getPosition(w) === currentPosition) {
        index++;
      }
    }
    return index;
  };

  useEffect(() => {
    if (window.electronAPI) {
      console.log(electronVersion);
      setElectronVersion(window.electronAPI.getAppVersion());
    }

    toast({
      title: "System Ready",
      description: "Star Habit is ready.",
      duration: 3000
    });
  }, []);

  useEffect(() => {
    if (hasStarted && isWorkMode) {
      const taskName = activeTask?.title;
      document.title = taskName
        ? `${formatTime(timeLeft)} - ${taskName}`
        : `${formatTime(timeLeft)} - Star Habit`;
    } else {
      document.title = "Star Habit";
    }
  }, [timeLeft, hasStarted, isWorkMode, activeTask, formatTime]);

  const handleSelectTaskFromMini = (task: Task) => {
    setActiveTask(task);
    if (isActive) {
      toggleTimer();
    }
  };

  const handleSkipPomodoro = () => {
    if (isWorkMode) {
      startBreak();
    } else {
      resetTimer();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {settings.showBg && (
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
      )}

      <TopBar
        currentView={currentView}
        onToggleMiniTaskList={() => toggleVisibility("miniTaskList")}
        onToggleMiniPomodoro={() => toggleVisibility("miniPomodoro")}
        onToggleMusicPlayer={() => toggleVisibility("musicPlayer")}
        onViewStats={() => setCurrentView("stats")}
      />

      {currentView === "pomodoro" && (
        <MiniTaskList
          isVisible={isVisible("miniTaskList")}
          isPinned={isPinned("miniTaskList")}
          position={getPosition("miniTaskList")}
          onClose={() => toggleVisibility("miniTaskList")}
          onTogglePin={() => togglePin("miniTaskList")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniTaskList", pos)
          }
          onSelectTask={handleSelectTaskFromMini}
          onClearTask={clearActiveTask}
          stackIndex={getStackIndex("miniTaskList")}
        />
      )}

      {currentView === "tasks" && (
        <MiniPomodoro
          isVisible={isVisible("miniPomodoro")}
          isPinned={isPinned("miniPomodoro")}
          position={getPosition("miniPomodoro")}
          timeLeft={timeLeft}
          isActive={isActive}
          isWorkMode={isWorkMode}
          hasStarted={hasStarted}
          onClose={() => toggleVisibility("miniPomodoro")}
          onTogglePin={() => togglePin("miniPomodoro")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniPomodoro", pos)
          }
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSkip={handleSkipPomodoro}
          stackIndex={getStackIndex("miniPomodoro")}
        />
      )}

      {/* Music Player - appears on all views */}
      <MiniMusicPlayer
        isVisible={isVisible("musicPlayer")}
        isPinned={isPinned("musicPlayer")}
        position={getPosition("musicPlayer")}
        onClose={() => toggleVisibility("musicPlayer")}
        onTogglePin={() => togglePin("musicPlayer")}
        onPositionChange={(pos: WidgetPosition) =>
          setPosition("musicPlayer", pos)
        }
        stackIndex={getStackIndex("musicPlayer")}
      />

      <div className="relative z-10 container max-w-[2000px] max-h-[2000px] w-full mx-auto p-5">
        {currentView === "pomodoro" && <PomodoroTimer />}
        {currentView === "tasks" && (
          <TaskList onNavigateToPomodoro={() => setCurrentView("pomodoro")} />
        )}
        {currentView === "projects" && <ProjectList />}
        {currentView === "stats" && <PomodoroStats />}
      </div>

      <AppDock currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

function App() {
  return (
    <PomodoroProvider>
      <AppContent />
    </PomodoroProvider>
  );
}

export default App

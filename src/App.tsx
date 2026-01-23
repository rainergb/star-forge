import { useEffect } from 'react'
import { TopBar } from "@/components/top-bar";
import { AppDock } from "@/content/dock/app-dock";
import { MainContent } from "@/components/main-content";
import { FloatingWidgetsLayer } from "@/components/floating/floating-widgets-layer";
import { LoginScreen } from "@/content/auth";
import { useToast } from "@/hooks/use-toast";
import { usePersonalize } from "@/hooks/use-personalize";
import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { useActiveTask } from "@/hooks/use-active-task";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  PomodoroProvider,
  usePomodoroContext
} from "@/context/pomodoro-context";
import {
  ActiveModuleProvider,
  useActiveModule
} from "@/context/active-module-context";
import { Task } from "@/types/task.types";
import bgVideo from "@/assets/bg.mp4";

function AppContent() {
  const { toast } = useToast();
  const { settings } = usePersonalize();
  const { setActiveTask, clearActiveTask, activeTask } = useActiveTask();
  const { selectedDate } = useActiveModule();
  const { toggleVisibility } = useFloatingWidgets();
  const {
    timeLeft,
    isActive,
    hasStarted,
    isWorkMode,
    toggleTimer,
    formatTime
  } = usePomodoroContext();
  const {
    currentView,
    taskFilterProjectId,
    changeView,
    navigateToPomodoro,
    navigateToTasksWithProject
  } = useAppNavigation();

  useEffect(() => {
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

  const handleSelectTask = (task: Task) => {
    setActiveTask(task);
    if (isActive) {
      toggleTimer();
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
        onToggleMiniProjectList={() => toggleVisibility("miniProjectList")}
        onToggleMiniMaestryList={() => toggleVisibility("miniMaestryList")}
        onToggleMiniCalendar={() => toggleVisibility("miniCalendar")}
        onViewStats={() => changeView("stats")}
      />

      <FloatingWidgetsLayer
        currentView={currentView}
        onSelectTask={handleSelectTask}
        onClearTask={clearActiveTask}
      />

      <MainContent
        currentView={currentView}
        selectedDate={selectedDate}
        taskFilterProjectId={taskFilterProjectId}
        onNavigateToPomodoro={navigateToPomodoro}
        onNavigateToTasksWithProject={navigateToTasksWithProject}
      />

      <AppDock currentView={currentView} onViewChange={changeView} />
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <PomodoroProvider>
      <ActiveModuleProvider>
        <AppContent />
      </ActiveModuleProvider>
    </PomodoroProvider>
  );
}

export default App

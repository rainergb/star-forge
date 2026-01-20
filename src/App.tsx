import { useState, useEffect } from 'react'
import { PomodoroTimer } from "@/content/pomodoro/pomodoro-timer";
import { PomodoroStats } from "@/content/stats";
import { TaskList } from "@/content/tasks/task-list";
import { ProjectList } from "@/content/projects/project-list";
import { SkillList } from "@/content/maestry";
import { DiaryList } from "@/content/diary/diary-list";
import { TopBar } from "@/components/top-bar";
import { AppDock } from "@/content/dock/app-dock";
import { useToast } from "@/hooks/use-toast";
import { usePersonalize } from "@/hooks/use-personalize";
import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { useActiveTask } from "@/hooks/use-active-task";
import { useCalendarData } from "@/hooks/use-calendar-data";
import {
  PomodoroProvider,
  usePomodoroContext
} from "@/context/pomodoro-context";
import {
  ActiveModuleProvider,
  useActiveModule
} from "@/context/active-module-context";
import { MiniTaskList } from "@/components/floating/mini-task-list";
import { MiniPomodoro } from "@/components/floating/mini-pomodoro";
import { MiniMusicPlayer } from "@/components/floating/mini-music-player";
import { MiniProjectList } from "@/components/floating/mini-project-list";
import { MiniMaestryList } from "@/components/floating/mini-maestry-list";
import { MiniFloatingCalendar } from "@/components/floating/mini-floating-calendar";
import { AppView } from "@/types/app.types";
import { Task } from "@/types/task.types";
import { WidgetPosition } from "@/types/widget.types";
import { CalendarModule } from "@/types/calendar.types";
import bgVideo from "@/assets/bg.mp4";

function AppContent() {
  const { toast } = useToast();
  const { settings } = usePersonalize();
  const { setActiveTask, clearActiveTask, activeTask } = useActiveTask();
  const { activeModule, setActiveModule, selectedDate, setSelectedDate } = useActiveModule();
  const {
    isVisible,
    isPinned,
    isExpanded,
    getPosition,
    setPosition,
    toggleVisibility,
    togglePin,
    toggleExpand,
    getStackIndex
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

  // Calendar data based on active module
  const calendarModule: CalendarModule = activeModule === "config" ? "stats" : activeModule;
  const { getDayData } = useCalendarData(calendarModule);

  const [currentView, setCurrentView] = useState<AppView>("pomodoro");
  const [electronVersion, setElectronVersion] =
    useState<string>("Carregando...");
  const [taskFilterProjectId, setTaskFilterProjectId] = useState<string | null>(
    null
  );

  // Sync currentView with activeModule
  useEffect(() => {
    const viewToModule: Record<AppView, CalendarModule> = {
      pomodoro: "pomodoro",
      tasks: "tasks",
      projects: "projects",
      maestry: "maestry",
      diary: "diary",
      stats: "stats"
    };
    setActiveModule(viewToModule[currentView]);
  }, [currentView, setActiveModule]);

  const handleNavigateToTasksWithProject = (projectId: string) => {
    setTaskFilterProjectId(projectId);
    setCurrentView("tasks");
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
        onToggleMiniProjectList={() => toggleVisibility("miniProjectList")}
        onToggleMiniMaestryList={() => toggleVisibility("miniMaestryList")}
        onToggleMiniCalendar={() => toggleVisibility("miniCalendar")}
        onViewStats={() => setCurrentView("stats")}
      />

      {currentView === "pomodoro" && (
        <MiniTaskList
          isVisible={isVisible("miniTaskList")}
          isPinned={isPinned("miniTaskList")}
          isExpanded={isExpanded("miniTaskList")}
          position={getPosition("miniTaskList")}
          onClose={() => toggleVisibility("miniTaskList")}
          onTogglePin={() => togglePin("miniTaskList")}
          onToggleExpand={() => toggleExpand("miniTaskList")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniTaskList", pos)
          }
          onSelectTask={handleSelectTaskFromMini}
          onClearTask={clearActiveTask}
          stackIndex={getStackIndex("miniTaskList")}
        />
      )}

      {currentView === "pomodoro" && (
        <MiniProjectList
          isVisible={isVisible("miniProjectList")}
          isPinned={isPinned("miniProjectList")}
          isExpanded={isExpanded("miniProjectList")}
          position={getPosition("miniProjectList")}
          onClose={() => toggleVisibility("miniProjectList")}
          onTogglePin={() => togglePin("miniProjectList")}
          onToggleExpand={() => toggleExpand("miniProjectList")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniProjectList", pos)
          }
          stackIndex={getStackIndex("miniProjectList")}
        />
      )}

      {currentView === "pomodoro" && (
        <MiniMaestryList
          isVisible={isVisible("miniMaestryList")}
          isPinned={isPinned("miniMaestryList")}
          isExpanded={isExpanded("miniMaestryList")}
          position={getPosition("miniMaestryList")}
          onClose={() => toggleVisibility("miniMaestryList")}
          onTogglePin={() => togglePin("miniMaestryList")}
          onToggleExpand={() => toggleExpand("miniMaestryList")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniMaestryList", pos)
          }
          stackIndex={getStackIndex("miniMaestryList")}
        />
      )}

      {currentView === "tasks" && (
        <MiniPomodoro
          isVisible={isVisible("miniPomodoro")}
          isPinned={isPinned("miniPomodoro")}
          isExpanded={isExpanded("miniPomodoro")}
          position={getPosition("miniPomodoro")}
          timeLeft={timeLeft}
          isActive={isActive}
          isWorkMode={isWorkMode}
          hasStarted={hasStarted}
          onClose={() => toggleVisibility("miniPomodoro")}
          onTogglePin={() => togglePin("miniPomodoro")}
          onToggleExpand={() => toggleExpand("miniPomodoro")}
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
        isExpanded={isExpanded("musicPlayer")}
        position={getPosition("musicPlayer")}
        onClose={() => toggleVisibility("musicPlayer")}
        onTogglePin={() => togglePin("musicPlayer")}
        onToggleExpand={() => toggleExpand("musicPlayer")}
        onPositionChange={(pos: WidgetPosition) =>
          setPosition("musicPlayer", pos)
        }
        stackIndex={getStackIndex("musicPlayer")}
      />

      {/* Calendar Widget - appears on all views except config */}
      {currentView !== "config" && (
        <MiniFloatingCalendar
          isVisible={isVisible("miniCalendar")}
          isPinned={isPinned("miniCalendar")}
          isExpanded={isExpanded("miniCalendar")}
          position={getPosition("miniCalendar")}
          onClose={() => toggleVisibility("miniCalendar")}
          onTogglePin={() => togglePin("miniCalendar")}
          onToggleExpand={() => toggleExpand("miniCalendar")}
          onPositionChange={(pos: WidgetPosition) =>
            setPosition("miniCalendar", pos)
          }
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          activeModule={calendarModule}
          getDayData={getDayData}
          stackIndex={getStackIndex("miniCalendar")}
        />
      )}

      <div className="relative z-10 container max-w-[2000px] max-h-[2000px] w-full mx-auto p-5">
        {currentView === "pomodoro" && <PomodoroTimer />}
        {currentView === "tasks" && (
          <TaskList
            onNavigateToPomodoro={() => setCurrentView("pomodoro")}
            initialFilterProjectId={taskFilterProjectId}
          />
        )}
        {currentView === "projects" && (
          <ProjectList onNavigateToTasks={handleNavigateToTasksWithProject} />
        )}
        {currentView === "maestry" && <SkillList />}
        {currentView === "diary" && <DiaryList />}
        {currentView === "stats" && <PomodoroStats />}
      </div>

      <AppDock
        currentView={currentView}
        onViewChange={(view) => {
          // Clear task filter when navigating away from tasks or to tasks manually
          if (view !== "tasks" || currentView !== "projects") {
            setTaskFilterProjectId(null);
          }
          setCurrentView(view);
        }}
      />
    </div>
  );
}

function App() {
  return (
    <PomodoroProvider>
      <ActiveModuleProvider>
        <AppContent />
      </ActiveModuleProvider>
    </PomodoroProvider>
  );
}

export default App

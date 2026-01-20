import { useFloatingWidgets } from "@/hooks/use-floating-widgets";
import { usePomodoroContext } from "@/context/pomodoro-context";
import { useActiveModule } from "@/context/active-module-context";
import { useCalendarData } from "@/hooks/use-calendar-data";
import { MiniTaskList } from "./mini-task-list";
import { MiniPomodoro } from "./mini-pomodoro";
import { MiniMusicPlayer } from "./mini-music-player";
import { MiniProjectList } from "./mini-project-list";
import { MiniMaestryList } from "./mini-maestry-list";
import { MiniFloatingCalendar } from "./mini-floating-calendar";
import { AppView } from "@/types/app.types";
import { Task } from "@/types/task.types";
import { WidgetPosition } from "@/types/widget.types";
import { CalendarModule } from "@/types/calendar.types";

interface FloatingWidgetsLayerProps {
  currentView: AppView;
  onSelectTask: (task: Task) => void;
  onClearTask: () => void;
}

export function FloatingWidgetsLayer({
  currentView,
  onSelectTask,
  onClearTask
}: FloatingWidgetsLayerProps) {
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
    isWorkMode,
    hasStarted,
    toggleTimer,
    resetTimer,
    startBreak
  } = usePomodoroContext();

  const { activeModule, selectedDate, setSelectedDate } = useActiveModule();

  // Calendar data based on active module
  const calendarModule: CalendarModule = activeModule === "config" ? "stats" : activeModule;
  const { getDayData } = useCalendarData(calendarModule);

  const handleSkipPomodoro = () => {
    if (isWorkMode) {
      startBreak();
    } else {
      resetTimer();
    }
  };

  return (
    <>
      {/* Task List Widget - All views except tasks */}
      {currentView !== "tasks" && (
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
          onSelectTask={onSelectTask}
          onClearTask={onClearTask}
          stackIndex={getStackIndex("miniTaskList")}
        />
      )}

      {/* Project List Widget - All views except projects */}
      {currentView !== "projects" && (
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

      {/* Maestry List Widget - All views except maestry */}
      {currentView !== "maestry" && (
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

      {/* Pomodoro Widget - All views except pomodoro */}
      {currentView !== "pomodoro" && (
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

      {/* Music Player - All views */}
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

      {/* Calendar Widget - All views */}
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
    </>
  );
}

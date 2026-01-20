import { useState, useEffect, useCallback } from "react";
import { useActiveModule } from "@/context/active-module-context";
import { AppView } from "@/types/app.types";
import { CalendarModule } from "@/types/calendar.types";

export function useAppNavigation() {
  const { setActiveModule } = useActiveModule();
  const [currentView, setCurrentView] = useState<AppView>("pomodoro");
  const [taskFilterProjectId, setTaskFilterProjectId] = useState<string | null>(null);

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

  const navigateToTasksWithProject = useCallback((projectId: string) => {
    setTaskFilterProjectId(projectId);
    setCurrentView("tasks");
  }, []);

  const navigateToPomodoro = useCallback(() => {
    setCurrentView("pomodoro");
  }, []);

  const changeView = useCallback((view: AppView) => {
    // Clear task filter when navigating away from tasks or to tasks manually
    if (view !== "tasks" || currentView !== "projects") {
      setTaskFilterProjectId(null);
    }
    setCurrentView(view);
  }, [currentView]);

  return {
    currentView,
    taskFilterProjectId,
    changeView,
    navigateToPomodoro,
    navigateToTasksWithProject
  };
}

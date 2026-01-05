import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ActiveTask } from "@/types/pomodoro.types";

const STORAGE_KEY = "star-habit-active-task";

interface ActiveTaskState {
  activeTask: ActiveTask | null;
}

const defaultState: ActiveTaskState = {
  activeTask: null
};

export function useActiveTask() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<ActiveTaskState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };

  const setActiveTask = useCallback(
    (task: ActiveTask) => {
      setState({ activeTask: task });
    },
    [setState]
  );

  const clearActiveTask = useCallback(() => {
    setState({ activeTask: null });
  }, [setState]);

  const linkTask = useCallback(
    (id: string, title: string) => {
      setState({ activeTask: { id, title } });
    },
    [setState]
  );

  return {
    activeTask: state.activeTask,
    setActiveTask,
    clearActiveTask,
    linkTask,
    hasActiveTask: state.activeTask !== null
  };
}

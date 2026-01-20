import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Task,
  TasksState,
  TaskStep,
  TaskReminder,
  TaskFile,
  TaskNote,
  RepeatType
} from "@/types/task.types";

const STORAGE_KEY = "star-habit-tasks";

const defaultState: TasksState = {
  tasks: []
};

export function useTasks() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<TasksState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const addTask = useCallback(
    (
      title: string,
      category: string = "Tarefas",
      options?: {
        dueDate?: number | null;
        reminder?: TaskReminder | null;
        estimatedPomodoros?: number | null;
        projectId?: string | null;
        skillIds?: string[];
      }
    ): string => {
      const id = generateId();
      const newTask: Task = {
        id,
        title,
        category,
        completed: false,
        favorite: false,
        createdAt: Date.now(),
        image: null,
        steps: [],
        dueDate: options?.dueDate ?? null,
        reminder: options?.reminder ?? null,
        repeat: null,
        files: [],
        notes: [],
        estimatedPomodoros: options?.estimatedPomodoros ?? null,
        completedPomodoros: 0,
        totalTimeSpent: 0,
        projectId: options?.projectId ?? null,
        skillIds: options?.skillIds ?? []
      };
      setState((prev) => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
      return id;
    },
    [setState]
  );

  const removeTask = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task.id !== id)
      }));
    },
    [setState]
  );

  const toggleCompleted = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      }));
    },
    [setState]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, favorite: !task.favorite } : task
        )
      }));
    },
    [setState]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      }));
    },
    [setState]
  );

  const addStep = useCallback(
    (taskId: string, stepTitle: string) => {
      const newStep: TaskStep = {
        id: generateId(),
        title: stepTitle,
        completed: false
      };
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, steps: [...(task.steps || []), newStep] }
            : task
        )
      }));
    },
    [setState]
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: (task.steps || []).map((step) =>
                  step.id === stepId
                    ? { ...step, completed: !step.completed }
                    : step
                )
              }
            : task
        )
      }));
    },
    [setState]
  );

  const removeStep = useCallback(
    (taskId: string, stepId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: (task.steps || []).filter((step) => step.id !== stepId)
              }
            : task
        )
      }));
    },
    [setState]
  );

  const setDueDate = useCallback(
    (taskId: string, dueDate: number | null) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, dueDate } : task
        )
      }));
    },
    [setState]
  );

  const setReminder = useCallback(
    (taskId: string, reminder: TaskReminder | null) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, reminder } : task
        )
      }));
    },
    [setState]
  );

  const setRepeat = useCallback(
    (taskId: string, repeat: RepeatType) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, repeat } : task
        )
      }));
    },
    [setState]
  );

  const addFile = useCallback(
    (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => {
      const newFile: TaskFile = {
        ...file,
        id: generateId(),
        addedAt: Date.now()
      };
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, files: [...(task.files || []), newFile] }
            : task
        )
      }));
    },
    [setState]
  );

  const removeFile = useCallback(
    (taskId: string, fileId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                files: (task.files || []).filter((f) => f.id !== fileId)
              }
            : task
        )
      }));
    },
    [setState]
  );

  const addNote = useCallback(
    (taskId: string, content: string) => {
      const newNote: TaskNote = {
        id: generateId(),
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, notes: [...(task.notes || []), newNote] }
            : task
        )
      }));
    },
    [setState]
  );

  const updateNote = useCallback(
    (taskId: string, noteId: string, content: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                notes: (task.notes || []).map((note) =>
                  note.id === noteId
                    ? { ...note, content, updatedAt: Date.now() }
                    : note
                )
              }
            : task
        )
      }));
    },
    [setState]
  );

  const removeNote = useCallback(
    (taskId: string, noteId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                notes: (task.notes || []).filter((note) => note.id !== noteId)
              }
            : task
        )
      }));
    },
    [setState]
  );

  const incrementPomodoro = useCallback(
    (taskId: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id !== taskId) return task;

          const newCompleted = (task.completedPomodoros || 0) + 1;
          const currentEstimated = task.estimatedPomodoros || 0;

          // Se não tem estimativa ou se completados ultrapassarem, ajusta a estimativa
          const newEstimated =
            currentEstimated < newCompleted ? newCompleted : currentEstimated;

          return {
            ...task,
            completedPomodoros: newCompleted,
            estimatedPomodoros: newEstimated > 0 ? newEstimated : null
          };
        })
      }));
    },
    [setState]
  );

  const addTimeSpent = useCallback(
    (taskId: string, seconds: number) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? { ...task, totalTimeSpent: (task.totalTimeSpent || 0) + seconds }
            : task
        )
      }));
    },
    [setState]
  );

  const setEstimatedPomodoros = useCallback(
    (taskId: string, count: number | null) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, estimatedPomodoros: count } : task
        )
      }));
    },
    [setState]
  );

  const clearCompleted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => !task.completed)
    }));
  }, [setState]);

  const getTask = useCallback(
    (id: string): Task | undefined => {
      return state.tasks.find((task) => task.id === id);
    },
    [state.tasks]
  );

  const reorderTasks = useCallback(
    (fromIndex: number, toIndex: number) => {
      setState((prev) => {
        const newTasks = [...prev.tasks];
        const [removed] = newTasks.splice(fromIndex, 1);
        newTasks.splice(toIndex, 0, removed);
        return { ...prev, tasks: newTasks };
      });
    },
    [setState]
  );

  const setProject = useCallback(
    (taskId: string, projectId: string | null) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, projectId } : task
        )
      }));
    },
    [setState]
  );

  const setSkills = useCallback(
    (taskId: string, skillIds: string[]) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, skillIds } : task
        )
      }));
    },
    [setState]
  );

  const getTasksByProject = useCallback(
    (projectId: string): Task[] => {
      return state.tasks.filter((task) => task.projectId === projectId);
    },
    [state.tasks]
  );

  const getTasksWithoutProject = useCallback((): Task[] => {
    return state.tasks.filter((task) => !task.projectId);
  }, [state.tasks]);

  const getTasksBySkill = useCallback(
    (skillId: string): Task[] => {
      return state.tasks.filter((task) => task.skillIds?.includes(skillId));
    },
    [state.tasks]
  );

  return {
    tasks: state.tasks,
    addTask,
    removeTask,
    toggleCompleted,
    toggleComplete: toggleCompleted,
    toggleFavorite,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    setDueDate,
    setReminder,
    setRepeat,
    addFile,
    removeFile,
    addNote,
    updateNote,
    removeNote,
    incrementPomodoro,
    addTimeSpent,
    setEstimatedPomodoros,
    clearCompleted,
    getTask,
    reorderTasks,
    setProject,
    setSkills,
    getTasksByProject,
    getTasksWithoutProject,
    getTasksBySkill
  };
}

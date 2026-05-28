import { useCallback } from "react";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Task,
  TasksState,
  TaskStep,
  TaskReminder,
  TaskFile,
  TaskNote,
  RepeatType,
  TaskPriority
} from "@/types/task.types";

const STORAGE_KEY = "star-habit-tasks";

const defaultState: TasksState = {
  tasks: []
};

function getNextDueDate(task: Task): number | null {
  const base = task.dueDate ? new Date(task.dueDate) : new Date();
  switch (task.repeat) {
    case "daily":   return addDays(base, 1).getTime();
    case "weekly":  return addWeeks(base, 1).getTime();
    case "monthly": return addMonths(base, 1).getTime();
    case "yearly":  return addYears(base, 1).getTime();
    case "custom": {
      const days = task.repeatDays || [];
      if (days.length === 0) return null;
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const next = addDays(today, i);
        if (days.includes(next.getDay())) return next.getTime();
      }
      return null;
    }
    default: return null;
  }
}

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
        priority?: TaskPriority;
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
        repeatDays: [],
        files: [],
        notes: [],
        estimatedPomodoros: options?.estimatedPomodoros ?? null,
        completedPomodoros: 0,
        totalTimeSpent: 0,
        projectId: options?.projectId ?? null,
        skillIds: options?.skillIds ?? [],
        priority: options?.priority ?? null
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
      setState((prev) => {
        const updatedTasks = prev.tasks.map((task) => {
          if (task.id !== id) return task;
          const newCompleted = !task.completed;
          return {
            ...task,
            completed: newCompleted,
            steps: task.steps.map((s) => ({ ...s, completed: newCompleted }))
          };
        });

        const completedTask = updatedTasks.find((t) => t.id === id);
        if (completedTask?.completed && completedTask.repeat) {
          const nextDueDate = getNextDueDate(completedTask);
          if (nextDueDate) {
            const nextTask: Task = {
              ...completedTask,
              id: generateId(),
              completed: false,
              createdAt: Date.now(),
              completedPomodoros: 0,
              totalTimeSpent: 0,
              dueDate: nextDueDate,
              steps: completedTask.steps.map((s) => ({ ...s, completed: false }))
            };
            return { ...prev, tasks: [nextTask, ...updatedTasks] };
          }
        }

        return { ...prev, tasks: updatedTasks };
      });
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
        tasks: prev.tasks.map((task) => {
          if (task.id !== taskId) return task;

          const updatedSteps = (task.steps || []).map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          );

          const allCompleted =
            updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);

          return { ...task, steps: updatedSteps, completed: allCompleted };
        })
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

  const updateStep = useCallback(
    (taskId: string, stepId: string, newTitle: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: (task.steps || []).map((step) =>
                  step.id === stepId ? { ...step, title: newTitle } : step
                )
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

  const reorderSteps = useCallback(
    (taskId: string, fromIndex: number, toIndex: number) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => {
          if (task.id !== taskId) return task;
          const newSteps = [...task.steps];
          const [removed] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, removed);
          return { ...task, steps: newSteps };
        })
      }));
    },
    [setState]
  );

  const duplicateTask = useCallback(
    (id: string) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === id);
        if (!task) return prev;
        const copy: Task = {
          ...task,
          id: generateId(),
          title: `${task.title} (copy)`,
          completed: false,
          createdAt: Date.now(),
          completedPomodoros: 0,
          totalTimeSpent: 0,
          steps: task.steps.map((s) => ({ ...s, completed: false }))
        };
        const index = prev.tasks.findIndex((t) => t.id === id);
        const newTasks = [...prev.tasks];
        newTasks.splice(index + 1, 0, copy);
        return { ...prev, tasks: newTasks };
      });
    },
    [setState]
  );

  const setRepeatDays = useCallback(
    (taskId: string, days: number[]) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, repeatDays: days } : task
        )
      }));
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

  const setPriority = useCallback(
    (taskId: string, priority: TaskPriority) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) =>
          task.id === taskId ? { ...task, priority } : task
        )
      }));
    },
    [setState]
  );

  const importTasks = useCallback(
    (importedTasks: Task[], mode: "merge" | "replace" = "merge") => {
      setState((prev) => {
        if (mode === "replace") {
          return { ...prev, tasks: importedTasks };
        }
        // Merge: add new tasks, skip existing ones by id
        const existingIds = new Set(prev.tasks.map((t) => t.id));
        const newTasks = importedTasks.filter((t) => !existingIds.has(t.id));
        return { ...prev, tasks: [...newTasks, ...prev.tasks] };
      });
    },
    [setState]
  );

  return {
    tasks: state.tasks,
    addTask,
    removeTask,
    toggleCompleted,
    toggleFavorite,
    updateTask,
    addStep,
    toggleStep,
    removeStep,
    updateStep,
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
    reorderSteps,
    duplicateTask,
    setRepeatDays,
    setProject,
    setSkills,
    setPriority,
    importTasks,
    getTasksByProject,
    getTasksWithoutProject,
    getTasksBySkill
  };
}

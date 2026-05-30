import { useCallback, useEffect, useState } from "react";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { tasksService } from "@/services/supabase";
import { recordUserActivity } from "@/hooks/use-streak";
import { taskCache } from "@/lib/cache-registry";
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
import { Database } from "@/types/database.types";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "star-habit-tasks";
const defaultState: TasksState = { tasks: [] };

const generateId = (): string => crypto.randomUUID();


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

// ─── Mapeamento DB ↔ Local ───────────────────────────────────────────────────

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? "Tarefas",
    completed: row.completed,
    favorite: row.favorite ?? false,
    createdAt: new Date(row.created_at).getTime(),
    image: row.image ?? null,
    steps: (row.steps as unknown as TaskStep[]) ?? [],
    dueDate: row.due_date ? new Date(row.due_date).getTime() : null,
    reminder: (row.reminder as unknown as TaskReminder | null) ?? null,
    repeat: (row.repeat as RepeatType) ?? null,
    repeatDays: (row.repeat_days as unknown as number[]) ?? [],
    files: (row.files as unknown as TaskFile[]) ?? [],
    notes: (row.task_notes as unknown as TaskNote[]) ?? [],
    estimatedPomodoros: row.estimated_pomodoros ?? null,
    completedPomodoros: row.completed_pomodoros ?? 0,
    totalTimeSpent: row.total_time_spent ?? 0,
    projectId: row.project_id ?? null,
    skillIds: (row.skill_ids as unknown as string[]) ?? [],
    priority: (row.priority as TaskPriority) ?? null
  };
}

function taskToInsert(task: Task, userId: string): TaskInsert {
  return {
    id: task.id,
    user_id: userId,
    project_id: task.projectId,
    title: task.title,
    completed: task.completed,
    priority: task.priority ?? null,
    due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    created_at: new Date(task.createdAt).toISOString(),
    updated_at: new Date().toISOString(),
    category: task.category,
    favorite: task.favorite,
    image: task.image,
    steps: task.steps as unknown as any,
    reminder: task.reminder as unknown as any,
    repeat: task.repeat,
    repeat_days: task.repeatDays as unknown as any,
    files: task.files as unknown as any,
    task_notes: task.notes as unknown as any,
    estimated_pomodoros: task.estimatedPomodoros,
    completed_pomodoros: task.completedPomodoros,
    total_time_spent: task.totalTimeSpent,
    skill_ids: task.skillIds as unknown as any
  };
}

function taskToUpdate(updates: Partial<Omit<Task, "id" | "createdAt">>): TaskUpdate {
  const u: TaskUpdate = {};
  if (updates.title !== undefined) u.title = updates.title;
  if (updates.completed !== undefined) u.completed = updates.completed;
  if (updates.favorite !== undefined) u.favorite = updates.favorite;
  if (updates.category !== undefined) u.category = updates.category;
  if (updates.priority !== undefined) u.priority = updates.priority ?? null;
  if (updates.image !== undefined) u.image = updates.image;
  if (updates.projectId !== undefined) u.project_id = updates.projectId;
  if (updates.dueDate !== undefined) u.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;
  if (updates.reminder !== undefined) u.reminder = updates.reminder as any;
  if (updates.repeat !== undefined) u.repeat = updates.repeat;
  if (updates.repeatDays !== undefined) u.repeat_days = updates.repeatDays as any;
  if (updates.steps !== undefined) u.steps = updates.steps as any;
  if (updates.files !== undefined) u.files = updates.files as any;
  if (updates.notes !== undefined) u.task_notes = updates.notes as any;
  if (updates.estimatedPomodoros !== undefined) u.estimated_pomodoros = updates.estimatedPomodoros;
  if (updates.completedPomodoros !== undefined) u.completed_pomodoros = updates.completedPomodoros;
  if (updates.totalTimeSpent !== undefined) u.total_time_spent = updates.totalTimeSpent;
  if (updates.skillIds !== undefined) u.skill_ids = updates.skillIds as any;
  u.updated_at = new Date().toISOString();
  return u;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTasks() {
  const { user, isGuest } = useAuth();
  const userId = user?.id ?? null;

  // --- Modo guest: localStorage ---
  const { value: localState, setValue: setLocalState } =
    useLocalStorage<TasksState>(STORAGE_KEY, defaultState);

  // --- Modo autenticado: Supabase ---
  const [dbTasks, setDbTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const tasks = isGuest ? (localState?.tasks ?? []) : dbTasks;

  /** Atualiza React state + cache de forma atômica */
  const setDbWithCache = (updater: (prev: Task[]) => Task[]) => {
    setDbTasks((prev) => {
      const next = updater(prev);
      taskCache.update(next);
      return next;
    });
  };

  // Carrega do Supabase ao montar (usa cache entre navegações)
  useEffect(() => {
    let cancelled = false;

    if (isGuest) { setIsLoading(false); return; }
    if (!userId) return;

    // SWR: mostra cache imediatamente, busca em background para atualizar
    const cached = taskCache.get(userId);
    if (cached) {
      setDbTasks(cached);
      setIsLoading(false);
      // Não retorna — continua para o fetch em background
    }
    if (!cached) setIsLoading(true);

    tasksService
      .getTasks(userId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(rowToTask);
        taskCache.set(userId, mapped);
        setDbTasks(mapped);
      })
      .catch((err) => { if (!cancelled) console.error("[useTasks] load:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [userId, isGuest]);

  // Helpers de atualização de estado
  const applyLocal = (updater: (prev: Task[]) => Task[]) => {
    setLocalState((prev) => ({ ...prev, tasks: updater(prev?.tasks ?? []) }));
  };
  const applyDb = (updater: (prev: Task[]) => Task[]) => setDbWithCache(updater);
  const applyState = (updater: (prev: Task[]) => Task[]) => {
    if (isGuest) applyLocal(updater);
    else applyDb(updater);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

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

      if (isGuest) {
        applyLocal((prev) => [newTask, ...prev]);
      } else {
        setDbWithCache((prev) => [newTask, ...prev]);
        if (userId) {
          tasksService
            .createTask(taskToInsert(newTask, userId))
            .catch((err) => console.error("[useTasks] create:", err));
        }
      }
      recordUserActivity();
      return id;
    },
    [isGuest, userId, setLocalState]
  );

  const removeTask = useCallback(
    (id: string) => {
      applyState((prev) => prev.filter((t) => t.id !== id));
      if (!isGuest) {
        tasksService
          .deleteTask(id)
          .catch((err) => console.error("[useTasks] delete:", err));
      }
    },
    [isGuest]
  );

  const toggleCompleted = useCallback(
    (id: string) => {
      applyState((prev) => {
        const updatedTasks = prev.map((task) => {
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
            return [nextTask, ...updatedTasks];
          }
        }
        return updatedTasks;
      });

      if (!isGuest) {
        const current = (isGuest ? localState?.tasks : dbTasks)?.find(
          (t) => t.id === id
        );
        if (current) {
          tasksService
            .updateTask(id, {
              completed: !current.completed,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] toggle:", err));
        }
      }
    },
    [isGuest, localState?.tasks, dbTasks]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      applyState((prev) =>
        prev.map((t) => (t.id === id ? { ...t, favorite: !t.favorite } : t))
      );
      if (!isGuest) {
        const current = dbTasks.find((t) => t.id === id);
        if (current) {
          tasksService
            .updateTask(id, { favorite: !current.favorite, updated_at: new Date().toISOString() })
            .catch((err) => console.error("[useTasks] toggleFavorite:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      applyState((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      if (!isGuest) {
        tasksService
          .updateTask(id, taskToUpdate(updates))
          .catch((err) => console.error("[useTasks] update:", err));
      }
    },
    [isGuest]
  );

  const addStep = useCallback(
    (taskId: string, stepTitle: string) => {
      const newStep: TaskStep = {
        id: generateId(),
        title: stepTitle,
        completed: false
      };
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, steps: [...(t.steps || []), newStep] }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              steps: [...task.steps, newStep] as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] addStep:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      applyState((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;
          const updatedSteps = (task.steps || []).map((s) =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted =
            updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);
          return { ...task, steps: updatedSteps, completed: allCompleted };
        })
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          const updatedSteps = task.steps.map((s) =>
            s.id === stepId ? { ...s, completed: !s.completed } : s
          );
          const allCompleted = updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);
          tasksService
            .updateTask(taskId, {
              steps: updatedSteps as any,
              completed: allCompleted,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] toggleStep:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const removeStep = useCallback(
    (taskId: string, stepId: string) => {
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, steps: (t.steps || []).filter((s) => s.id !== stepId) }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              steps: task.steps.filter((s) => s.id !== stepId) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] removeStep:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const updateStep = useCallback(
    (taskId: string, stepId: string, newTitle: string) => {
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                steps: (t.steps || []).map((s) =>
                  s.id === stepId ? { ...s, title: newTitle } : s
                )
              }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              steps: task.steps.map((s) =>
                s.id === stepId ? { ...s, title: newTitle } : s
              ) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] updateStep:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const setDueDate = useCallback(
    (taskId: string, dueDate: number | null) => {
      updateTask(taskId, { dueDate });
    },
    [updateTask]
  );

  const setReminder = useCallback(
    (taskId: string, reminder: TaskReminder | null) => {
      updateTask(taskId, { reminder });
    },
    [updateTask]
  );

  const setRepeat = useCallback(
    (taskId: string, repeat: RepeatType) => {
      updateTask(taskId, { repeat });
    },
    [updateTask]
  );

  const addFile = useCallback(
    (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => {
      const newFile: TaskFile = { ...file, id: generateId(), addedAt: Date.now() };
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, files: [...(t.files || []), newFile] }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              files: [...task.files, newFile] as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] addFile:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const removeFile = useCallback(
    (taskId: string, fileId: string) => {
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, files: (t.files || []).filter((f) => f.id !== fileId) }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              files: task.files.filter((f) => f.id !== fileId) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] removeFile:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const addNote = useCallback(
    (taskId: string, content: string) => {
      const newNote: TaskNote = {
        id: generateId(),
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, notes: [...(t.notes || []), newNote] }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              task_notes: [...task.notes, newNote] as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] addNote:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const updateNote = useCallback(
    (taskId: string, noteId: string, content: string) => {
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                notes: (t.notes || []).map((n) =>
                  n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
                )
              }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              task_notes: task.notes.map((n) =>
                n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
              ) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] updateNote:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const removeNote = useCallback(
    (taskId: string, noteId: string) => {
      applyState((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, notes: (t.notes || []).filter((n) => n.id !== noteId) }
            : t
        )
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              task_notes: task.notes.filter((n) => n.id !== noteId) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] removeNote:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const incrementPomodoro = useCallback(
    (taskId: string) => {
      console.log("[useTasks] incrementPomodoro called for:", taskId);
      applyState((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const newCompleted = (t.completedPomodoros || 0) + 1;
          console.log("[useTasks] Updated completedPomodoros:", newCompleted);
          const currentEstimated = t.estimatedPomodoros || 0;
          const newEstimated =
            currentEstimated < newCompleted ? newCompleted : currentEstimated;
          return {
            ...t,
            completedPomodoros: newCompleted,
            estimatedPomodoros: newEstimated > 0 ? newEstimated : null
          };
        })
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          const newCompleted = (task.completedPomodoros || 0) + 1;
          const currentEstimated = task.estimatedPomodoros || 0;
          const newEstimated =
            currentEstimated < newCompleted ? newCompleted : currentEstimated;
          tasksService
            .updateTask(taskId, {
              completed_pomodoros: newCompleted,
              estimated_pomodoros: newEstimated > 0 ? newEstimated : null,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] incrementPomodoro:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const addTimeSpent = useCallback(
    (taskId: string, seconds: number) => {
      console.log("[useTasks] addTimeSpent called:", { taskId, seconds });
      applyState((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const newTime = (t.totalTimeSpent || 0) + seconds;
            console.log("[useTasks] Updated totalTimeSpent:", newTime);
            return { ...t, totalTimeSpent: newTime };
          }
          return t;
        })
      );
      if (!isGuest) {
        const task = dbTasks.find((t) => t.id === taskId);
        if (task) {
          tasksService
            .updateTask(taskId, {
              total_time_spent: (task.totalTimeSpent || 0) + seconds,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useTasks] addTimeSpent:", err));
        }
      }
    },
    [isGuest, dbTasks]
  );

  const setEstimatedPomodoros = useCallback(
    (taskId: string, count: number | null) => {
      updateTask(taskId, { estimatedPomodoros: count });
    },
    [updateTask]
  );

  const clearCompleted = useCallback(() => {
    const completed = tasks.filter((t) => t.completed).map((t) => t.id);
    applyState((prev) => prev.filter((t) => !t.completed));
    if (!isGuest && completed.length > 0) {
      tasksService
        .deleteTasks(completed)
        .catch((err) => console.error("[useTasks] clearCompleted:", err));
    }
  }, [isGuest, tasks]);

  const getTask = useCallback(
    (id: string): Task | undefined => tasks.find((t) => t.id === id),
    [tasks]
  );

  const reorderTasks = useCallback(
    (fromIndex: number, toIndex: number) => {
      applyState((prev) => {
        const newTasks = [...prev];
        const [removed] = newTasks.splice(fromIndex, 1);
        newTasks.splice(toIndex, 0, removed);
        return newTasks;
      });
    },
    []
  );

  const reorderSteps = useCallback(
    (taskId: string, fromIndex: number, toIndex: number) => {
      applyState((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const newSteps = [...t.steps];
          const [removed] = newSteps.splice(fromIndex, 1);
          newSteps.splice(toIndex, 0, removed);
          return { ...t, steps: newSteps };
        })
      );
    },
    []
  );

  const duplicateTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const copy: Task = {
        ...task,
        id: generateId(),
        title: `${task.title} (copy)`,
        completed: false,
        createdAt: Date.now(),
        completedPomodoros: 0,
        totalTimeSpent: 0,
        steps: task.steps.map((s) => ({ ...s, id: generateId(), completed: false }))
      };
      applyState((prev) => {
        const index = prev.findIndex((t) => t.id === id);
        const newTasks = [...prev];
        newTasks.splice(index + 1, 0, copy);
        return newTasks;
      });
      if (!isGuest && userId) {
        tasksService
          .createTask(taskToInsert(copy, userId))
          .catch((err) => console.error("[useTasks] duplicate:", err));
      }
    },
    [isGuest, userId, tasks]
  );

  const setRepeatDays = useCallback(
    (taskId: string, days: number[]) => {
      updateTask(taskId, { repeatDays: days });
    },
    [updateTask]
  );

  const setProject = useCallback(
    (taskId: string, projectId: string | null) => {
      updateTask(taskId, { projectId });
    },
    [updateTask]
  );

  const setSkills = useCallback(
    (taskId: string, skillIds: string[]) => {
      updateTask(taskId, { skillIds });
    },
    [updateTask]
  );

  const setPriority = useCallback(
    (taskId: string, priority: TaskPriority) => {
      updateTask(taskId, { priority });
    },
    [updateTask]
  );

  const getTasksByProject = useCallback(
    (projectId: string): Task[] =>
      tasks.filter((t) => t.projectId === projectId),
    [tasks]
  );

  const getTasksWithoutProject = useCallback(
    (): Task[] => tasks.filter((t) => !t.projectId),
    [tasks]
  );

  const getTasksBySkill = useCallback(
    (skillId: string): Task[] =>
      tasks.filter((t) => t.skillIds?.includes(skillId)),
    [tasks]
  );

  const importTasks = useCallback(
    (importedTasks: Task[], mode: "merge" | "replace" = "merge") => {
      applyState((prev) => {
        if (mode === "replace") return importedTasks;
        const existingIds = new Set(prev.map((t) => t.id));
        const newTasks = importedTasks.filter((t) => !existingIds.has(t.id));
        return [...newTasks, ...prev];
      });
    },
    []
  );

  return {
    tasks,
    isLoading,
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

import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Task, TasksState, TaskStep, TaskReminder, TaskFile, TaskNote } from "@/types/task.types";

const STORAGE_KEY = "star-forge-tasks";

const defaultState: TasksState = {
  tasks: []
};

export function useTasks() {
  const { value: storedState, setValue: setState } = useLocalStorage<TasksState>(
    STORAGE_KEY,
    defaultState
  );

  const state = { ...defaultState, ...storedState };

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const addTask = useCallback(
    (title: string, category: string = "Tarefas") => {
      const newTask: Task = {
        id: generateId(),
        title,
        category,
        completed: false,
        favorite: false,
        createdAt: Date.now(),
        steps: [],
        dueDate: null,
        reminder: null,
        files: [],
        notes: []
      };
      setState({ ...state, tasks: [newTask, ...state.tasks] });
    },
    [state, setState]
  );

  const removeTask = useCallback(
    (id: string) => {
      setState({ ...state, tasks: state.tasks.filter((task) => task.id !== id) });
    },
    [state, setState]
  );

  const toggleCompleted = useCallback(
    (id: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      });
    },
    [state, setState]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, favorite: !task.favorite } : task
        )
      });
    },
    [state, setState]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      });
    },
    [state, setState]
  );

  const addStep = useCallback(
    (taskId: string, stepTitle: string) => {
      const newStep: TaskStep = {
        id: generateId(),
        title: stepTitle,
        completed: false
      };
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, steps: [...(task.steps || []), newStep] }
            : task
        )
      });
    },
    [state, setState]
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                steps: (task.steps || []).map((step) =>
                  step.id === stepId ? { ...step, completed: !step.completed } : step
                )
              }
            : task
        )
      });
    },
    [state, setState]
  );

  const removeStep = useCallback(
    (taskId: string, stepId: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, steps: (task.steps || []).filter((step) => step.id !== stepId) }
            : task
        )
      });
    },
    [state, setState]
  );

  const setDueDate = useCallback(
    (taskId: string, dueDate: number | null) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, dueDate } : task
        )
      });
    },
    [state, setState]
  );

  const setReminder = useCallback(
    (taskId: string, reminder: TaskReminder | null) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, reminder } : task
        )
      });
    },
    [state, setState]
  );

  const addFile = useCallback(
    (taskId: string, file: Omit<TaskFile, "id" | "addedAt">) => {
      const newFile: TaskFile = {
        ...file,
        id: generateId(),
        addedAt: Date.now()
      };
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, files: [...(task.files || []), newFile] }
            : task
        )
      });
    },
    [state, setState]
  );

  const removeFile = useCallback(
    (taskId: string, fileId: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, files: (task.files || []).filter((f) => f.id !== fileId) }
            : task
        )
      });
    },
    [state, setState]
  );

  const addNote = useCallback(
    (taskId: string, content: string) => {
      const newNote: TaskNote = {
        id: generateId(),
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, notes: [...(task.notes || []), newNote] }
            : task
        )
      });
    },
    [state, setState]
  );

  const updateNote = useCallback(
    (taskId: string, noteId: string, content: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
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
      });
    },
    [state, setState]
  );

  const removeNote = useCallback(
    (taskId: string, noteId: string) => {
      setState({
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? { ...task, notes: (task.notes || []).filter((note) => note.id !== noteId) }
            : task
        )
      });
    },
    [state, setState]
  );

  const clearCompleted = useCallback(() => {
    setState({ ...state, tasks: state.tasks.filter((task) => !task.completed) });
  }, [state, setState]);

  const getTask = useCallback(
    (id: string): Task | undefined => {
      return state.tasks.find((task) => task.id === id);
    },
    [state.tasks]
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
    setDueDate,
    setReminder,
    addFile,
    removeFile,
    addNote,
    updateNote,
    removeNote,
    clearCompleted,
    getTask
  };
}

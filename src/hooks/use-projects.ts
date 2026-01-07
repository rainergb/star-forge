import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Project,
  ProjectsState,
  ProjectStatus,
  ProjectColor,
  ProjectIcon,
  ProjectStats
} from "@/types/project.types";
import { useTasks } from "@/hooks/use-tasks";

const STORAGE_KEY = "star-habit-projects";

const defaultState: ProjectsState = {
  projects: []
};

export function useProjects() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<ProjectsState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };
  const { tasks } = useTasks();

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const addProject = useCallback(
    (
      name: string,
      options?: {
        description?: string | null;
        color?: ProjectColor;
        icon?: ProjectIcon;
        dueDate?: number | null;
        estimatedPomodoros?: number | null;
      }
    ): string => {
      const id = generateId();
      const now = Date.now();
      const maxSortOrder = Math.max(
        0,
        ...state.projects.map((p) => p.sortOrder)
      );

      const newProject: Project = {
        id,
        name,
        description: options?.description ?? null,
        color: options?.color ?? "purple",
        icon: options?.icon ?? { type: "lucide", value: "Folder" },
        status: "active",
        favorite: false,
        createdAt: now,
        updatedAt: now,
        dueDate: options?.dueDate ?? null,
        estimatedPomodoros: options?.estimatedPomodoros ?? null,
        completedPomodoros: 0,
        totalTimeSpent: 0,
        sortOrder: maxSortOrder + 1
      };

      setState((prev) => ({
        ...prev,
        projects: [newProject, ...prev.projects]
      }));

      return id;
    },
    [setState, state.projects]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === id
            ? { ...project, ...updates, updatedAt: Date.now() }
            : project
        )
      }));
    },
    [setState]
  );

  const removeProject = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((project) => project.id !== id)
      }));
    },
    [setState]
  );

  const setStatus = useCallback(
    (id: string, status: ProjectStatus) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === id
            ? { ...project, status, updatedAt: Date.now() }
            : project
        )
      }));
    },
    [setState]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === id
            ? { ...project, favorite: !project.favorite, updatedAt: Date.now() }
            : project
        )
      }));
    },
    [setState]
  );

  const reorderProjects = useCallback(
    (projectIds: string[]) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) => ({
          ...project,
          sortOrder: projectIds.indexOf(project.id)
        }))
      }));
    },
    [setState]
  );

  const getProject = useCallback(
    (id: string): Project | undefined => {
      return state.projects.find((project) => project.id === id);
    },
    [state.projects]
  );

  const getProjectsByStatus = useCallback(
    (status: ProjectStatus): Project[] => {
      return state.projects.filter((project) => project.status === status);
    },
    [state.projects]
  );

  const getFavoriteProjects = useCallback((): Project[] => {
    return state.projects.filter((project) => project.favorite);
  }, [state.projects]);

  const getProjectStats = useCallback(
    (projectId: string): ProjectStats => {
      const projectTasks = tasks.filter((task) => task.projectId === projectId);
      const completedTasks = projectTasks.filter((task) => task.completed);
      const pendingTasks = projectTasks.filter((task) => !task.completed);

      const totalPomodoros = projectTasks.reduce(
        (sum, task) => sum + (task.estimatedPomodoros || 0),
        0
      );
      const completedPomodoros = projectTasks.reduce(
        (sum, task) => sum + (task.completedPomodoros || 0),
        0
      );
      const totalTimeSpent = projectTasks.reduce(
        (sum, task) => sum + (task.totalTimeSpent || 0),
        0
      );

      const completionPercentage =
        projectTasks.length > 0
          ? (completedTasks.length / projectTasks.length) * 100
          : 0;

      const avgTimePerPomodoro = completedPomodoros > 0
        ? totalTimeSpent / completedPomodoros
        : 1500;
      const remainingPomodoros = totalPomodoros - completedPomodoros;
      const estimatedTimeRemaining = Math.max(0, remainingPomodoros * avgTimePerPomodoro);

      return {
        projectId,
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        totalPomodoros,
        completedPomodoros,
        totalTimeSpent,
        completionPercentage,
        estimatedTimeRemaining
      };
    },
    [tasks]
  );

  const incrementPomodoro = useCallback(
    (projectId: string) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                completedPomodoros: project.completedPomodoros + 1,
                updatedAt: Date.now()
              }
            : project
        )
      }));
    },
    [setState]
  );

  const addTimeSpent = useCallback(
    (projectId: string, seconds: number) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                totalTimeSpent: project.totalTimeSpent + seconds,
                updatedAt: Date.now()
              }
            : project
        )
      }));
    },
    [setState]
  );

  const sortedProjects = useMemo(() => {
    return [...state.projects].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [state.projects]);

  const activeProjects = useMemo(() => {
    return sortedProjects.filter((p) => p.status === "active");
  }, [sortedProjects]);

  return {
    projects: sortedProjects,
    activeProjects,
    addProject,
    updateProject,
    removeProject,
    setStatus,
    toggleFavorite,
    reorderProjects,
    getProject,
    getProjectsByStatus,
    getFavoriteProjects,
    getProjectStats,
    incrementPomodoro,
    addTimeSpent
  };
}

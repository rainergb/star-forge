import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { projectsService } from "@/services/supabase";
import { projectCache } from "@/lib/cache-registry";
import {
  Project,
  ProjectNote,
  ProjectsState,
  ProjectStatus,
  ProjectColor,
  ProjectIcon,
  ProjectStats
} from "@/types/project.types";
import { useTasks } from "@/hooks/use-tasks";
import { Database } from "@/types/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "star-habit-projects";
const defaultState: ProjectsState = { projects: [] };

const generateId = (): string => crypto.randomUUID();


// ─── Mapeamento DB ↔ Local ───────────────────────────────────────────────────

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    color: (row.color as ProjectColor) ?? "purple",
    icon: (row.icon as unknown as ProjectIcon) ?? { type: "lucide", value: "Folder" },
    image: row.image ?? null,
    status: row.status as ProjectStatus,
    favorite: row.favorite ?? false,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at ?? row.created_at).getTime(),
    dueDate: row.due_date ? new Date(row.due_date).getTime() : null,
    estimatedPomodoros: row.estimated_pomodoros ?? null,
    completedPomodoros: row.completed_pomodoros ?? 0,
    totalTimeSpent: row.total_time_spent ?? 0,
    sortOrder: row.sort_order ?? 0,
    notes: (row.project_notes as unknown as ProjectNote[]) ?? []
  };
}

function projectToInsert(project: Project, userId: string): ProjectInsert {
  return {
    id: project.id,
    user_id: userId,
    name: project.name,
    description: project.description,
    color: project.color,
    status: project.status,
    total_time_spent: project.totalTimeSpent,
    created_at: new Date(project.createdAt).toISOString(),
    icon: project.icon as unknown as any,
    image: project.image,
    favorite: project.favorite,
    due_date: project.dueDate ? new Date(project.dueDate).toISOString() : null,
    estimated_pomodoros: project.estimatedPomodoros,
    completed_pomodoros: project.completedPomodoros,
    sort_order: project.sortOrder,
    updated_at: new Date(project.updatedAt).toISOString(),
    project_notes: project.notes as unknown as any
  };
}

function projectToUpdate(updates: Partial<Omit<Project, "id" | "createdAt">>): ProjectUpdate {
  const u: ProjectUpdate = {};
  if (updates.name !== undefined) u.name = updates.name;
  if (updates.description !== undefined) u.description = updates.description;
  if (updates.color !== undefined) u.color = updates.color;
  if (updates.status !== undefined) u.status = updates.status;
  if (updates.favorite !== undefined) u.favorite = updates.favorite;
  if (updates.image !== undefined) u.image = updates.image;
  if (updates.dueDate !== undefined) u.due_date = updates.dueDate ? new Date(updates.dueDate as number).toISOString() : null;
  if (updates.estimatedPomodoros !== undefined) u.estimated_pomodoros = updates.estimatedPomodoros;
  if (updates.completedPomodoros !== undefined) u.completed_pomodoros = updates.completedPomodoros;
  if (updates.totalTimeSpent !== undefined) u.total_time_spent = updates.totalTimeSpent;
  if (updates.sortOrder !== undefined) u.sort_order = updates.sortOrder;
  if (updates.icon !== undefined) u.icon = updates.icon as unknown as any;
  if (updates.notes !== undefined) u.project_notes = updates.notes as unknown as any;
  u.updated_at = new Date().toISOString();
  return u;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useProjects() {
  const { user, isGuest } = useAuth();
  const userId = user?.id ?? null;
  const { tasks } = useTasks();

  // --- Modo guest: localStorage ---
  const { value: localState, setValue: setLocalState } =
    useLocalStorage<ProjectsState>(STORAGE_KEY, defaultState);

  // --- Modo autenticado: Supabase ---
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const projects = isGuest ? (localState?.projects ?? []) : dbProjects;

  /** Atualiza React state + cache de forma atômica */
  const setDbWithCache = (updater: (prev: Project[]) => Project[]) => {
    setDbProjects((prev) => {
      const next = updater(prev);
      projectCache.update(next);
      return next;
    });
  };

  // Carrega do Supabase ao montar (usa cache entre navegações)
  useEffect(() => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }
    if (!userId) return;
    const cached = projectCache.get(userId);
    if (cached) {
      setDbProjects(cached);
      setIsLoading(false);
      return;
    }
    projectsService
      .getProjects(userId)
      .then((rows) => {
        const mapped = rows.map(rowToProject);
        projectCache.set(userId, mapped);
        setDbProjects(mapped);
      })
      .catch((err) => console.error("[useProjects] load:", err))
      .finally(() => setIsLoading(false));
  }, [userId, isGuest]);

  const applyState = (updater: (prev: Project[]) => Project[]) => {
    if (isGuest) {
      setLocalState((prev) => ({ ...prev, projects: updater(prev?.projects ?? []) }));
    } else {
      setDbWithCache(updater);
    }
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

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
      const maxSortOrder = Math.max(0, ...projects.map((p) => p.sortOrder));
      const newProject: Project = {
        id,
        name,
        description: options?.description ?? null,
        color: options?.color ?? "purple",
        icon: options?.icon ?? { type: "lucide", value: "Folder" },
        image: null,
        status: "active",
        favorite: false,
        createdAt: now,
        updatedAt: now,
        dueDate: options?.dueDate ?? null,
        estimatedPomodoros: options?.estimatedPomodoros ?? null,
        completedPomodoros: 0,
        totalTimeSpent: 0,
        sortOrder: maxSortOrder + 1,
        notes: []
      };

      if (isGuest) {
        setLocalState((prev) => ({
          ...prev,
          projects: [newProject, ...(prev?.projects ?? [])]
        }));
      } else {
        setDbWithCache((prev) => [newProject, ...prev]);
        if (userId) {
          projectsService
            .createProject(projectToInsert(newProject, userId))
            .catch((err) => console.error("[useProjects] create:", err));
        }
      }
      return id;
    },
    [isGuest, userId, projects, setLocalState]
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => {
      applyState((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      );
      if (!isGuest) {
        projectsService
          .updateProject(id, projectToUpdate(updates))
          .catch((err) => console.error("[useProjects] update:", err));
      }
    },
    [isGuest]
  );

  const removeProject = useCallback(
    (id: string) => {
      applyState((prev) => prev.filter((p) => p.id !== id));
      if (!isGuest) {
        projectsService
          .deleteProject(id)
          .catch((err) => console.error("[useProjects] delete:", err));
      }
    },
    [isGuest]
  );

  const setStatus = useCallback(
    (id: string, status: ProjectStatus) => {
      updateProject(id, { status });
    },
    [updateProject]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      const current = projects.find((p) => p.id === id);
      if (current) updateProject(id, { favorite: !current.favorite });
    },
    [projects, updateProject]
  );

  const reorderProjects = useCallback(
    (projectIds: string[]) => {
      applyState((prev) =>
        prev.map((p) => ({ ...p, sortOrder: projectIds.indexOf(p.id) }))
      );
      if (!isGuest) {
        const currentProjects = dbProjects;
        currentProjects.forEach((p) => {
          const newOrder = projectIds.indexOf(p.id);
          if (newOrder !== p.sortOrder) {
            projectsService
              .updateProject(p.id, {
                sort_order: newOrder,
                updated_at: new Date().toISOString()
              })
              .catch((err) => console.error("[useProjects] reorder:", err));
          }
        });
      }
    },
    [isGuest, dbProjects]
  );

  const getProject = useCallback(
    (id: string): Project | undefined => projects.find((p) => p.id === id),
    [projects]
  );

  const getProjectsByStatus = useCallback(
    (status: ProjectStatus): Project[] =>
      projects.filter((p) => p.status === status),
    [projects]
  );

  const getFavoriteProjects = useCallback(
    (): Project[] => projects.filter((p) => p.favorite),
    [projects]
  );

  const getProjectStats = useCallback(
    (projectId: string): ProjectStats => {
      const projectTasks = tasks.filter((t) => t.projectId === projectId);
      const completedTasks = projectTasks.filter((t) => t.completed);
      const pendingTasks = projectTasks.filter((t) => !t.completed);
      const totalPomodoros = projectTasks.reduce((s, t) => s + (t.estimatedPomodoros || 0), 0);
      const completedPomodoros = projectTasks.reduce((s, t) => s + (t.completedPomodoros || 0), 0);
      const totalTimeSpent = projectTasks.reduce((s, t) => s + (t.totalTimeSpent || 0), 0);
      const completionPercentage =
        projectTasks.length > 0
          ? (completedTasks.length / projectTasks.length) * 100
          : 0;
      const avgTimePerPomodoro = completedPomodoros > 0 ? totalTimeSpent / completedPomodoros : 1500;
      const estimatedTimeRemaining = Math.max(0, (totalPomodoros - completedPomodoros) * avgTimePerPomodoro);

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
      const current = projects.find((p) => p.id === projectId);
      if (current) {
        updateProject(projectId, { completedPomodoros: current.completedPomodoros + 1 });
      }
    },
    [projects, updateProject]
  );

  const addTimeSpent = useCallback(
    (projectId: string, seconds: number) => {
      const current = projects.find((p) => p.id === projectId);
      if (current) {
        updateProject(projectId, { totalTimeSpent: current.totalTimeSpent + seconds });
      }
    },
    [projects, updateProject]
  );

  const addNote = useCallback(
    (projectId: string, content: string) => {
      const newNote: ProjectNote = {
        id: generateId(),
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      applyState((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, notes: [...(p.notes || []), newNote], updatedAt: Date.now() }
            : p
        )
      );
      if (!isGuest) {
        const project = dbProjects.find((p) => p.id === projectId);
        if (project) {
          projectsService
            .updateProject(projectId, {
              project_notes: [...project.notes, newNote] as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useProjects] addNote:", err));
        }
      }
    },
    [isGuest, dbProjects]
  );

  const updateNote = useCallback(
    (projectId: string, noteId: string, content: string) => {
      applyState((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                notes: (p.notes || []).map((n) =>
                  n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
                ),
                updatedAt: Date.now()
              }
            : p
        )
      );
      if (!isGuest) {
        const project = dbProjects.find((p) => p.id === projectId);
        if (project) {
          projectsService
            .updateProject(projectId, {
              project_notes: project.notes.map((n) =>
                n.id === noteId ? { ...n, content, updatedAt: Date.now() } : n
              ) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useProjects] updateNote:", err));
        }
      }
    },
    [isGuest, dbProjects]
  );

  const removeNote = useCallback(
    (projectId: string, noteId: string) => {
      applyState((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                notes: (p.notes || []).filter((n) => n.id !== noteId),
                updatedAt: Date.now()
              }
            : p
        )
      );
      if (!isGuest) {
        const project = dbProjects.find((p) => p.id === projectId);
        if (project) {
          projectsService
            .updateProject(projectId, {
              project_notes: project.notes.filter((n) => n.id !== noteId) as any,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useProjects] removeNote:", err));
        }
      }
    },
    [isGuest, dbProjects]
  );

  const importProjects = useCallback(
    (importedProjects: Project[], mode: "merge" | "replace" = "merge") => {
      applyState((prev) => {
        if (mode === "replace") return importedProjects;
        const existingIds = new Set(prev.map((p) => p.id));
        const newProjects = importedProjects.filter((p) => !existingIds.has(p.id));
        return [...newProjects, ...prev];
      });
    },
    []
  );

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [projects]);

  const activeProjects = useMemo(
    () => sortedProjects.filter((p) => p.status === "active"),
    [sortedProjects]
  );

  return {
    projects: sortedProjects,
    activeProjects,
    isLoading,
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
    addTimeSpent,
    addNote,
    updateNote,
    removeNote,
    importProjects
  };
}

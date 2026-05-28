/**
 * Registro central de caches de dados.
 * Exporta instâncias únicas para cada hook, permitindo
 * invalidação global no logout sem dependências circulares.
 */

import { createHookCache } from "@/hooks/use-hook-cache";
import type { Task } from "@/types/task.types";
import type { Project } from "@/types/project.types";
import type { Skill } from "@/types/skill.types";
import type { DiaryEntry } from "@/types/diary.types";
import type { PomodoroSession } from "@/types/pomodoro.types";

export const taskCache = createHookCache<Task>();
export const projectCache = createHookCache<Project>();
export const skillCache = createHookCache<Skill>();
export const diaryCache = createHookCache<DiaryEntry>();
export const sessionCache = createHookCache<PomodoroSession>();

/** Invalida todos os caches — deve ser chamado no logout */
export function invalidateAllCaches(): void {
  taskCache.invalidate();
  projectCache.invalidate();
  skillCache.invalidate();
  diaryCache.invalidate();
  sessionCache.invalidate();
}

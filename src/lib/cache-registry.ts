/**
 * Registro central de caches de dados.
 * Exporta instâncias únicas para cada hook, permitindo
 * invalidação global no logout sem dependências circulares.
 *
 * O storageKey habilita persistência no localStorage —
 * dados ficam disponíveis instantaneamente no próximo start do app.
 */

import { createHookCache } from "@/hooks/use-hook-cache";
import type { Task } from "@/types/task.types";
import type { Project } from "@/types/project.types";
import type { Skill } from "@/types/skill.types";
import type { DiaryEntry } from "@/types/diary.types";
import type { PomodoroSession } from "@/types/pomodoro.types";

export const taskCache    = createHookCache<Task>("tasks");
export const projectCache = createHookCache<Project>("projects");
export const skillCache   = createHookCache<Skill>("skills");
export const diaryCache   = createHookCache<DiaryEntry>("diary");
export const sessionCache = createHookCache<PomodoroSession>("sessions");

/** Invalida todos os caches (memória + localStorage) — deve ser chamado no logout */
export function invalidateAllCaches(): void {
  taskCache.invalidate();
  projectCache.invalidate();
  skillCache.invalidate();
  diaryCache.invalidate();
  sessionCache.invalidate();
}

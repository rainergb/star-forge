/**
 * Serviço de migração de dados do localStorage para o Supabase.
 * Executado uma única vez quando o usuário faz login pela primeira vez
 * em um dispositivo que já tinha dados salvos localmente.
 */

import { supabase } from "@/lib/supabase";
import type { Task } from "@/types/task.types";
import type { Project } from "@/types/project.types";
import type { Skill } from "@/types/skill.types";
import type { DiaryEntry, MoodLevel } from "@/types/diary.types";
import type { PomodoroSession } from "@/types/pomodoro.types";

// ─── Chaves do localStorage ──────────────────────────────────────────────────

const LS_TASKS = "star-habit-tasks";
const LS_PROJECTS = "star-habit-projects";
const LS_SKILLS = "star-habit-skills";
const LS_DIARY = "star-habit-diary";
const LS_SESSIONS = "star-habit-pomodoro-sessions";
const LS_GUEST_MODE = "star-habit-guest-mode";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface LocalData {
  tasks: Task[];
  projects: Project[];
  skills: Skill[];
  entries: DiaryEntry[];
  sessions: PomodoroSession[];
}

export interface MigrationSummary {
  tasks: number;
  projects: number;
  skills: number;
  entries: number;
  sessions: number;
  total: number;
}

// ─── Leitura do localStorage ─────────────────────────────────────────────────

function parseKey<T>(key: string, accessor: (v: unknown) => T[] | undefined): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return accessor(parsed) ?? [];
  } catch {
    return [];
  }
}

export function readLocalData(): LocalData {
  return {
    tasks: parseKey(LS_TASKS, (v: any) => v?.tasks),
    projects: parseKey(LS_PROJECTS, (v: any) => v?.projects),
    skills: parseKey(LS_SKILLS, (v: any) => v?.skills),
    entries: parseKey(LS_DIARY, (v: any) => v?.entries),
    sessions: parseKey(LS_SESSIONS, (v: any) => v?.sessions)
  };
}

export function getSummary(data: LocalData): MigrationSummary {
  const tasks = data.tasks.length;
  const projects = data.projects.length;
  const skills = data.skills.length;
  const entries = data.entries.length;
  const sessions = data.sessions.length;
  return { tasks, projects, skills, entries, sessions, total: tasks + projects + skills + entries + sessions };
}

export function hasLocalData(data: LocalData): boolean {
  return getSummary(data).total > 0;
}

export function clearLocalData(): void {
  localStorage.removeItem(LS_TASKS);
  localStorage.removeItem(LS_PROJECTS);
  localStorage.removeItem(LS_SKILLS);
  localStorage.removeItem(LS_DIARY);
  localStorage.removeItem(LS_SESSIONS);
  localStorage.removeItem(LS_GUEST_MODE);
}

// ─── Helpers de mapeamento ───────────────────────────────────────────────────

const toIso = (v: number | string | null | undefined): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v;
  return new Date(v).toISOString();
};

const now = () => new Date().toISOString();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id: string) => UUID_RE.test(id);
const toUUID = (id: string) => (isValidUUID(id) ? id : crypto.randomUUID());

// Espelho do LEVEL_TO_MOOD de use-diary.ts
const LEVEL_TO_MOOD: Record<number, string> = {
  1: "very_bad",
  2: "bad",
  3: "neutral",
  4: "good",
  5: "very_good"
};

// ─── Migração para o Supabase ─────────────────────────────────────────────────

export async function migrateToSupabase(userId: string, data: LocalData): Promise<void> {
  const errors: string[] = [];

  // Pré-computar mapeamento oldId → UUID para preservar referências entre entidades
  const projectIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();
  const skillIdMap = new Map<string, string>();
  const diaryIdMap = new Map<string, string>();
  const sessionIdMap = new Map<string, string>();

  data.projects.forEach(p => projectIdMap.set(p.id, toUUID(p.id)));
  data.tasks.forEach(t => taskIdMap.set(t.id, toUUID(t.id)));
  data.skills.forEach(s => skillIdMap.set(s.id, toUUID(s.id)));
  data.entries.forEach(e => diaryIdMap.set(e.id, toUUID(e.id)));
  data.sessions.forEach(s => sessionIdMap.set(s.id, toUUID(s.id)));

  // ── Tasks ──────────────────────────────────────────────────────────────────
  if (data.tasks.length > 0) {
    const rows = data.tasks.map((t) => ({
      id: taskIdMap.get(t.id)!,
      user_id: userId,
      project_id: t.projectId ? (projectIdMap.get(t.projectId) ?? null) : null,
      title: t.title,
      completed: t.completed,
      priority: t.priority ?? null,
      due_date: toIso(t.dueDate),
      created_at: toIso(t.createdAt) ?? now(),
      updated_at: now(),
      category: t.category ?? "Tarefas",
      favorite: t.favorite ?? false,
      image: t.image ?? null,
      steps: t.steps as unknown,
      reminder: t.reminder as unknown ?? null,
      repeat: t.repeat ?? null,
      repeat_days: t.repeatDays as unknown ?? [],
      files: t.files as unknown ?? [],
      task_notes: t.notes as unknown ?? [],
      estimated_pomodoros: t.estimatedPomodoros ?? null,
      completed_pomodoros: t.completedPomodoros ?? 0,
      total_time_spent: t.totalTimeSpent ?? 0,
      skill_ids: (t.skillIds ?? []).map((sid: string) => skillIdMap.get(sid) ?? sid) as unknown
    }));

    const { error } = await supabase
      .from("tasks")
      .upsert(rows as any, { onConflict: "id", ignoreDuplicates: true });
    if (error) errors.push(`tasks: ${error.message}`);
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  if (data.projects.length > 0) {
    const rows = data.projects.map((p) => ({
      id: projectIdMap.get(p.id)!,
      user_id: userId,
      name: p.name,
      description: p.description ?? null,
      color: p.color ?? "purple",
      status: p.status ?? "active",
      total_time_spent: p.totalTimeSpent ?? 0,
      created_at: toIso(p.createdAt) ?? now(),
      icon: p.icon as unknown ?? null,
      image: p.image ?? null,
      favorite: p.favorite ?? false,
      due_date: toIso(p.dueDate),
      estimated_pomodoros: p.estimatedPomodoros ?? null,
      completed_pomodoros: p.completedPomodoros ?? 0,
      sort_order: p.sortOrder ?? 0,
      updated_at: toIso(p.updatedAt) ?? now(),
      project_notes: p.notes as unknown ?? []
    }));

    const { error } = await supabase
      .from("projects")
      .upsert(rows as any, { onConflict: "id", ignoreDuplicates: true });
    if (error) errors.push(`projects: ${error.message}`);
  }

  // ── Skills ─────────────────────────────────────────────────────────────────
  if (data.skills.length > 0) {
    const rows = data.skills.map((s) => ({
      id: skillIdMap.get(s.id)!,
      user_id: userId,
      name: s.name,
      description: s.description ?? null,
      color: s.color ?? "purple",
      icon: s.icon as unknown ?? null,
      image: s.image ?? null,
      current_level: s.currentLevel ?? 1,
      total_time_spent: s.totalTimeSpent ?? 0,
      total_pomodoros: s.totalPomodoros ?? 0,
      created_at: toIso(s.createdAt) ?? now(),
      updated_at: toIso(s.updatedAt) ?? now()
    }));

    const { error } = await supabase
      .from("skills")
      .upsert(rows as any, { onConflict: "id", ignoreDuplicates: true });
    if (error) errors.push(`skills: ${error.message}`);
  }

  // ── Diary entries ──────────────────────────────────────────────────────────
  if (data.entries.length > 0) {
    const rows = data.entries.map((e) => ({
      id: diaryIdMap.get(e.id)!,
      user_id: userId,
      date: e.date,
      content: e.content,
      mood: e.mood?.level != null ? LEVEL_TO_MOOD[e.mood.level as MoodLevel] ?? null : null,
      created_at: toIso(e.createdAt) ?? now(),
      entry_type: e.type ?? "note",
      time: e.time ?? null,
      image: e.image ?? null,
      mood_entry: e.mood as unknown ?? null,
      linked_task_id: e.linkedTaskId ? (taskIdMap.get(e.linkedTaskId) ?? null) : null,
      tags: e.tags as unknown ?? [],
      favorite: e.favorite ?? false,
      files: e.files as unknown ?? [],
      updated_at: toIso(e.updatedAt) ?? now()
    }));

    const { error } = await supabase
      .from("diary_entries")
      .upsert(rows as any, { onConflict: "id", ignoreDuplicates: true });
    if (error) errors.push(`diary: ${error.message}`);
  }

  // ── Pomodoro sessions ──────────────────────────────────────────────────────
  if (data.sessions.length > 0) {
    const rows = data.sessions.map((s) => ({
      id: sessionIdMap.get(s.id)!,
      user_id: userId,
      task_id: s.taskId ? (taskIdMap.get(s.taskId) ?? null) : null,
      task_title: s.taskTitle ?? null,
      mode: s.mode,
      duration: s.duration,
      completed: s.completed,
      started_at: toIso(s.startedAt) ?? now(),
      ended_at: toIso(s.endedAt) ?? null
    }));

    const { error } = await supabase
      .from("pomodoro_sessions")
      .upsert(rows as any, { onConflict: "id", ignoreDuplicates: true });
    if (error) errors.push(`sessions: ${error.message}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
}

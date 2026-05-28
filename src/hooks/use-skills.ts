import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useAuth } from "@/hooks/use-auth";
import { skillsService } from "@/services/supabase";
import { skillCache } from "@/lib/cache-registry";
import {
  Skill,
  SkillsState,
  SkillColor,
  SkillIcon,
  SkillStats,
  MasteryLevel,
  calculateMasteryLevel,
  getMasteryLevelInfo,
  getProgressToNextLevel
} from "@/types/skill.types";
import { useTasks } from "@/hooks/use-tasks";
import { Database } from "@/types/database.types";

type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
type SkillInsert = Database["public"]["Tables"]["skills"]["Insert"];
type SkillUpdate = Database["public"]["Tables"]["skills"]["Update"];

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "star-habit-skills";
const defaultState: SkillsState = { skills: [] };

const generateId = (): string => crypto.randomUUID();


// ─── Mapeamento DB ↔ Local ───────────────────────────────────────────────────

function rowToSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    color: (row.color as SkillColor) ?? "purple",
    icon: (row.icon as unknown as SkillIcon) ?? { type: "lucide", value: "Zap" },
    image: row.image ?? null,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at ?? row.created_at).getTime(),
    totalTimeSpent: row.total_time_spent ?? 0,
    totalPomodoros: row.total_pomodoros ?? 0,
    currentLevel: (row.current_level as MasteryLevel) ?? 1
  };
}

function skillToInsert(skill: Skill, userId: string): SkillInsert {
  return {
    id: skill.id,
    user_id: userId,
    name: skill.name,
    description: skill.description,
    color: skill.color,
    icon: skill.icon as unknown as any,
    image: skill.image,
    current_level: skill.currentLevel,
    total_time_spent: skill.totalTimeSpent,
    total_pomodoros: skill.totalPomodoros,
    created_at: new Date(skill.createdAt).toISOString(),
    updated_at: new Date(skill.updatedAt).toISOString()
  };
}

function skillToUpdate(updates: Partial<Omit<Skill, "id" | "createdAt">>): SkillUpdate {
  const u: SkillUpdate = {};
  if (updates.name !== undefined) u.name = updates.name;
  if (updates.description !== undefined) u.description = updates.description;
  if (updates.color !== undefined) u.color = updates.color;
  if (updates.icon !== undefined) u.icon = updates.icon as unknown as any;
  if (updates.image !== undefined) u.image = updates.image;
  if (updates.currentLevel !== undefined) u.current_level = updates.currentLevel;
  if (updates.totalTimeSpent !== undefined) u.total_time_spent = updates.totalTimeSpent;
  if (updates.totalPomodoros !== undefined) u.total_pomodoros = updates.totalPomodoros;
  u.updated_at = new Date().toISOString();
  return u;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSkills() {
  const { user, isGuest } = useAuth();
  const userId = user?.id ?? null;
  const { tasks } = useTasks();

  // --- Modo guest: localStorage ---
  const { value: localState, setValue: setLocalState } =
    useLocalStorage<SkillsState>(STORAGE_KEY, defaultState);

  // --- Modo autenticado: Supabase ---
  const [dbSkills, setDbSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const skills = isGuest ? (localState?.skills ?? []) : dbSkills;

  /** Atualiza React state + cache de forma atômica */
  const setDbWithCache = (updater: (prev: Skill[]) => Skill[]) => {
    setDbSkills((prev) => {
      const next = updater(prev);
      skillCache.update(next);
      return next;
    });
  };

  // Carrega do Supabase ao montar (usa cache entre navegações)
  useEffect(() => {
    let cancelled = false;

    if (isGuest) { setIsLoading(false); return; }
    if (!userId) return;

    const cached = skillCache.get(userId);
    if (cached) { setDbSkills(cached); setIsLoading(false); return; }

    setIsLoading(true);
    skillsService
      .getSkills(userId)
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(rowToSkill);
        skillCache.set(userId, mapped);
        setDbSkills(mapped);
      })
      .catch((err) => { if (!cancelled) console.error("[useSkills] load:", err); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [userId, isGuest]);

  const applyState = (updater: (prev: Skill[]) => Skill[]) => {
    if (isGuest) {
      setLocalState((prev) => ({ ...prev, skills: updater(prev?.skills ?? []) }));
    } else {
      setDbWithCache(updater);
    }
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const addSkill = useCallback(
    (
      name: string,
      options?: {
        description?: string | null;
        color?: SkillColor;
        icon?: SkillIcon;
      }
    ): string => {
      const id = generateId();
      const now = Date.now();
      const newSkill: Skill = {
        id,
        name,
        description: options?.description ?? null,
        color: options?.color ?? "purple",
        icon: options?.icon ?? { type: "lucide", value: "Zap" },
        image: null,
        createdAt: now,
        updatedAt: now,
        totalTimeSpent: 0,
        totalPomodoros: 0,
        currentLevel: 1
      };

      if (isGuest) {
        setLocalState((prev) => ({
          ...prev,
          skills: [newSkill, ...(prev?.skills ?? [])]
        }));
      } else {
        setDbWithCache((prev) => [newSkill, ...prev]);
        if (userId) {
          skillsService
            .createSkill(skillToInsert(newSkill, userId))
            .catch((err) => console.error("[useSkills] create:", err));
        }
      }
      return id;
    },
    [isGuest, userId, setLocalState]
  );

  const updateSkill = useCallback(
    (id: string, updates: Partial<Omit<Skill, "id" | "createdAt">>) => {
      applyState((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
        )
      );
      if (!isGuest) {
        skillsService
          .updateSkill(id, skillToUpdate(updates))
          .catch((err) => console.error("[useSkills] update:", err));
      }
    },
    [isGuest]
  );

  const removeSkill = useCallback(
    (id: string) => {
      applyState((prev) => prev.filter((s) => s.id !== id));
      if (!isGuest) {
        skillsService
          .deleteSkill(id)
          .catch((err) => console.error("[useSkills] delete:", err));
      }
    },
    [isGuest]
  );

  const addTime = useCallback(
    (id: string, durationSeconds: number): { leveledUp: boolean; newLevel: MasteryLevel } => {
      let leveledUp = false;
      let newLevel: MasteryLevel = 1;

      applyState((prev) =>
        prev.map((skill) => {
          if (skill.id !== id) return skill;
          const newTotalTime = skill.totalTimeSpent + durationSeconds;
          const calculatedLevel = calculateMasteryLevel(newTotalTime);
          leveledUp = calculatedLevel > skill.currentLevel;
          newLevel = calculatedLevel;
          return {
            ...skill,
            totalTimeSpent: newTotalTime,
            totalPomodoros: skill.totalPomodoros + 1,
            currentLevel: calculatedLevel,
            updatedAt: Date.now()
          };
        })
      );

      if (!isGuest) {
        const skill = dbSkills.find((s) => s.id === id);
        if (skill) {
          const newTotalTime = skill.totalTimeSpent + durationSeconds;
          const calculatedLevel = calculateMasteryLevel(newTotalTime);
          skillsService
            .updateSkill(id, {
              total_time_spent: newTotalTime,
              total_pomodoros: skill.totalPomodoros + 1,
              current_level: calculatedLevel,
              updated_at: new Date().toISOString()
            })
            .catch((err) => console.error("[useSkills] addTime:", err));
        }
      }

      return { leveledUp, newLevel };
    },
    [isGuest, dbSkills]
  );

  const addTimeToMultiple = useCallback(
    (
      skillIds: string[],
      durationSeconds: number
    ): { skillId: string; leveledUp: boolean; newLevel: MasteryLevel }[] => {
      const results: { skillId: string; leveledUp: boolean; newLevel: MasteryLevel }[] = [];

      applyState((prev) =>
        prev.map((skill) => {
          if (!skillIds.includes(skill.id)) return skill;
          const newTotalTime = skill.totalTimeSpent + durationSeconds;
          const calculatedLevel = calculateMasteryLevel(newTotalTime);
          results.push({
            skillId: skill.id,
            leveledUp: calculatedLevel > skill.currentLevel,
            newLevel: calculatedLevel
          });
          return {
            ...skill,
            totalTimeSpent: newTotalTime,
            totalPomodoros: skill.totalPomodoros + 1,
            currentLevel: calculatedLevel,
            updatedAt: Date.now()
          };
        })
      );

      if (!isGuest) {
        skillIds.forEach((sid) => {
          const skill = dbSkills.find((s) => s.id === sid);
          if (skill) {
            const newTotalTime = skill.totalTimeSpent + durationSeconds;
            const calculatedLevel = calculateMasteryLevel(newTotalTime);
            skillsService
              .updateSkill(sid, {
                total_time_spent: newTotalTime,
                total_pomodoros: skill.totalPomodoros + 1,
                current_level: calculatedLevel,
                updated_at: new Date().toISOString()
              })
              .catch((err) => console.error("[useSkills] addTimeToMultiple:", err));
          }
        });
      }

      return results;
    },
    [isGuest, dbSkills]
  );

  const getSkill = useCallback(
    (id: string): Skill | undefined => skills.find((s) => s.id === id),
    [skills]
  );

  const getSkillStats = useCallback(
    (id: string): SkillStats | null => {
      const skill = skills.find((s) => s.id === id);
      if (!skill) return null;
      const progress = getProgressToNextLevel(skill.totalTimeSpent);
      const levelInfo = getMasteryLevelInfo(skill.currentLevel);
      const skillTasks = tasks.filter((t) => t.skillIds?.includes(id));
      return {
        skillId: id,
        currentLevel: skill.currentLevel,
        currentLevelName: levelInfo.name,
        totalHours: skill.totalTimeSpent / 3600,
        hoursToNextLevel: progress.hoursToNextLevel,
        progressPercentage: progress.progressPercentage,
        totalPomodoros: skill.totalPomodoros,
        totalTasks: skillTasks.length,
        activeTasks: skillTasks.filter((t) => !t.completed).length
      };
    },
    [skills, tasks]
  );

  const getSkillsByIds = useCallback(
    (ids: string[]): Skill[] => skills.filter((s) => ids.includes(s.id)),
    [skills]
  );

  const importSkills = useCallback(
    (importedSkills: Skill[], mode: "merge" | "replace" = "merge") => {
      applyState((prev) => {
        if (mode === "replace") return importedSkills;
        const existingIds = new Set(prev.map((s) => s.id));
        const newSkills = importedSkills.filter((s) => !existingIds.has(s.id));
        return [...newSkills, ...prev];
      });
    },
    []
  );

  return {
    skills,
    isLoading,
    addSkill,
    updateSkill,
    removeSkill,
    addTime,
    addTimeToMultiple,
    getSkill,
    getSkillStats,
    getSkillsByIds,
    importSkills
  };
}

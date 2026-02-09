import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
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

const STORAGE_KEY = "star-habit-skills";

const defaultState: SkillsState = {
  skills: []
};

export function useSkills() {
  const { value: storedState, setValue: setState } =
    useLocalStorage<SkillsState>(STORAGE_KEY, defaultState);

  const state = { ...defaultState, ...storedState };
  const { tasks } = useTasks();

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

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

      setState((prev) => ({
        ...prev,
        skills: [newSkill, ...prev.skills]
      }));

      return id;
    },
    [setState]
  );

  const updateSkill = useCallback(
    (id: string, updates: Partial<Omit<Skill, "id" | "createdAt">>) => {
      setState((prev) => ({
        ...prev,
        skills: prev.skills.map((skill) =>
          skill.id === id
            ? { ...skill, ...updates, updatedAt: Date.now() }
            : skill
        )
      }));
    },
    [setState]
  );

  const removeSkill = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill.id !== id)
      }));
    },
    [setState]
  );

  const addTime = useCallback(
    (
      id: string,
      durationSeconds: number
    ): { leveledUp: boolean; newLevel: MasteryLevel } => {
      let leveledUp = false;
      let newLevel: MasteryLevel = 1;

      setState((prev) => ({
        ...prev,
        skills: prev.skills.map((skill) => {
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
      }));

      return { leveledUp, newLevel };
    },
    [setState]
  );

  const addTimeToMultiple = useCallback(
    (
      skillIds: string[],
      durationSeconds: number
    ): { skillId: string; leveledUp: boolean; newLevel: MasteryLevel }[] => {
      const results: {
        skillId: string;
        leveledUp: boolean;
        newLevel: MasteryLevel;
      }[] = [];

      setState((prev) => ({
        ...prev,
        skills: prev.skills.map((skill) => {
          if (!skillIds.includes(skill.id)) return skill;

          const newTotalTime = skill.totalTimeSpent + durationSeconds;
          const calculatedLevel = calculateMasteryLevel(newTotalTime);
          const leveledUp = calculatedLevel > skill.currentLevel;

          results.push({
            skillId: skill.id,
            leveledUp,
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
      }));

      return results;
    },
    [setState]
  );

  const getSkill = useCallback(
    (id: string): Skill | undefined => {
      return state.skills.find((skill) => skill.id === id);
    },
    [state.skills]
  );

  const getSkillStats = useCallback(
    (id: string): SkillStats | null => {
      const skill = getSkill(id);
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
    [getSkill, tasks]
  );

  const getSkillsByIds = useCallback(
    (ids: string[]): Skill[] => {
      return state.skills.filter((skill) => ids.includes(skill.id));
    },
    [state.skills]
  );

  const importSkills = useCallback(
    (importedSkills: Skill[], mode: "merge" | "replace" = "merge") => {
      setState((prev) => {
        if (mode === "replace") {
          return { ...prev, skills: importedSkills };
        }
        // Merge: add new skills, skip existing ones by id
        const existingIds = new Set(prev.skills.map((s) => s.id));
        const newSkills = importedSkills.filter((s) => !existingIds.has(s.id));
        return { ...prev, skills: [...newSkills, ...prev.skills] };
      });
    },
    [setState]
  );

  return {
    skills: state.skills,
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

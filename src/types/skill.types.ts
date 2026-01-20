export type SkillColor =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "pink"
  | "cyan"
  | "yellow";

export interface SkillIcon {
  type: "emoji" | "lucide";
  value: string;
}

export type MasteryLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface MasteryLevelInfo {
  level: MasteryLevel;
  name: string;
  minHours: number;
  maxHours: number;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string | null;
  color: SkillColor;
  icon: SkillIcon;
  image: string | null;
  createdAt: number;
  updatedAt: number;
  totalTimeSpent: number;
  totalPomodoros: number;
  currentLevel: MasteryLevel;
}

export interface SkillsState {
  skills: Skill[];
}

export interface SkillStats {
  skillId: string;
  currentLevel: MasteryLevel;
  currentLevelName: string;
  totalHours: number;
  hoursToNextLevel: number;
  progressPercentage: number;
  totalPomodoros: number;
  totalTasks: number;
  activeTasks: number;
}

export const MASTERY_LEVELS: MasteryLevelInfo[] = [
  {
    level: 1,
    name: "Beginner",
    minHours: 0,
    maxHours: 100,
    description: "Starting the journey"
  },
  {
    level: 2,
    name: "Apprentice",
    minHours: 100,
    maxHours: 500,
    description: "Building basic competence"
  },
  {
    level: 3,
    name: "Practitioner",
    minHours: 500,
    maxHours: 2000,
    description: "Developing consistency"
  },
  {
    level: 4,
    name: "Competent",
    minHours: 2000,
    maxHours: 4000,
    description: "Solid understanding"
  },
  {
    level: 5,
    name: "Advanced",
    minHours: 4000,
    maxHours: 6500,
    description: "Deep knowledge"
  },
  {
    level: 6,
    name: "Expert",
    minHours: 6500,
    maxHours: 9000,
    description: "Complex mastery"
  },
  {
    level: 7,
    name: "Master",
    minHours: 9000,
    maxHours: 10000,
    description: "Complete mastery"
  }
];

export const SKILL_COLORS: Record<
  SkillColor,
  { bg: string; border: string; text: string; solid: string }
> = {
  purple: {
    bg: "bg-[#6A30FF]/20",
    border: "border-[#6A30FF]/50",
    text: "text-[#6A30FF]",
    solid: "#6A30FF"
  },
  blue: {
    bg: "bg-[#1A7FFF]/20",
    border: "border-[#1A7FFF]/50",
    text: "text-[#1A7FFF]",
    solid: "#1A7FFF"
  },
  green: {
    bg: "bg-[#22C55E]/20",
    border: "border-[#22C55E]/50",
    text: "text-[#22C55E]",
    solid: "#22C55E"
  },
  orange: {
    bg: "bg-[#F97316]/20",
    border: "border-[#F97316]/50",
    text: "text-[#F97316]",
    solid: "#F97316"
  },
  red: {
    bg: "bg-[#EF4444]/20",
    border: "border-[#EF4444]/50",
    text: "text-[#EF4444]",
    solid: "#EF4444"
  },
  pink: {
    bg: "bg-[#EC4899]/20",
    border: "border-[#EC4899]/50",
    text: "text-[#EC4899]",
    solid: "#EC4899"
  },
  cyan: {
    bg: "bg-[#06B6D4]/20",
    border: "border-[#06B6D4]/50",
    text: "text-[#06B6D4]",
    solid: "#06B6D4"
  },
  yellow: {
    bg: "bg-[#EAB308]/20",
    border: "border-[#EAB308]/50",
    text: "text-[#EAB308]",
    solid: "#EAB308"
  }
};

export function calculateMasteryLevel(totalSeconds: number): MasteryLevel {
  const hours = totalSeconds / 3600;

  for (let i = MASTERY_LEVELS.length - 1; i >= 0; i--) {
    if (hours >= MASTERY_LEVELS[i].minHours) {
      return MASTERY_LEVELS[i].level;
    }
  }

  return 1;
}

export function getMasteryLevelInfo(level: MasteryLevel): MasteryLevelInfo {
  return MASTERY_LEVELS[level - 1];
}

export function getProgressToNextLevel(totalSeconds: number): {
  currentLevel: MasteryLevel;
  progressPercentage: number;
  hoursToNextLevel: number;
} {
  const hours = totalSeconds / 3600;
  const currentLevel = calculateMasteryLevel(totalSeconds);
  const levelInfo = getMasteryLevelInfo(currentLevel);

  if (currentLevel === 7) {
    const progressInLevel = hours - levelInfo.minHours;
    const levelRange = levelInfo.maxHours - levelInfo.minHours;
    const progressPercentage = Math.min(
      100,
      (progressInLevel / levelRange) * 100
    );
    return {
      currentLevel,
      progressPercentage,
      hoursToNextLevel: Math.max(0, levelInfo.maxHours - hours)
    };
  }

  const nextLevelInfo = getMasteryLevelInfo((currentLevel + 1) as MasteryLevel);
  const progressInLevel = hours - levelInfo.minHours;
  const levelRange = nextLevelInfo.minHours - levelInfo.minHours;
  const progressPercentage = (progressInLevel / levelRange) * 100;
  const hoursToNextLevel = nextLevelInfo.minHours - hours;

  return {
    currentLevel,
    progressPercentage,
    hoursToNextLevel
  };
}

export type ProjectStatus = "active" | "paused" | "completed";

export type ProjectColor =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "pink"
  | "cyan"
  | "yellow";

export interface ProjectIcon {
  type: "emoji" | "lucide";
  value: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: ProjectColor;
  icon: ProjectIcon;
  image: string | null;
  status: ProjectStatus;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate: number | null;
  estimatedPomodoros: number | null;
  completedPomodoros: number;
  totalTimeSpent: number;
  sortOrder: number;
}

export interface ProjectsState {
  projects: Project[];
}

export interface ProjectStats {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPomodoros: number;
  completedPomodoros: number;
  totalTimeSpent: number;
  completionPercentage: number;
  estimatedTimeRemaining: number;
}

export const PROJECT_COLORS: Record<
  ProjectColor,
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

export const DEFAULT_PROJECT_ICONS = [
  { type: "lucide" as const, value: "Folder" },
  { type: "lucide" as const, value: "FolderKanban" },
  { type: "lucide" as const, value: "Briefcase" },
  { type: "lucide" as const, value: "GraduationCap" },
  { type: "lucide" as const, value: "Code" },
  { type: "lucide" as const, value: "Palette" },
  { type: "lucide" as const, value: "Music" },
  { type: "lucide" as const, value: "Camera" },
  { type: "lucide" as const, value: "Book" },
  { type: "lucide" as const, value: "Rocket" },
  { type: "lucide" as const, value: "Target" },
  { type: "lucide" as const, value: "Trophy" },
  { type: "lucide" as const, value: "Star" },
  { type: "lucide" as const, value: "Heart" },
  { type: "lucide" as const, value: "Zap" },
  { type: "lucide" as const, value: "Flame" }
];

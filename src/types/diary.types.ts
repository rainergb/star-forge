export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodEmoji = "😢" | "😕" | "😐" | "🙂" | "😄";

export type DiaryEntryType =
  | "note"
  | "event"
  | "mood"
  | "task-created"
  | "task-completed"
  | "pomodoro-summary";

export interface MoodEntry {
  level: MoodLevel;
  emoji: MoodEmoji;
  note: string | null;
}

export interface DiaryFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "document" | "other";
  mimeType: string;
  size: number;
  addedAt: number;
}

export interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  content: string;
  createdAt: number;
  updatedAt: number;
  date: string;
  time: string | null;
  mood: MoodEntry | null;
  linkedTaskId: string | null;
  tags: string[];
  favorite: boolean;
  files: DiaryFile[];
}

export interface DailyMoodSummary {
  date: string;
  averageMood: number;
  moodCount: number;
  dominantMood: MoodLevel;
}

export interface DailySummary {
  date: string;
  entries: DiaryEntry[];
  moodSummary: DailyMoodSummary | null;
  tasksCreated: number;
  tasksCompleted: number;
  pomodorosCompleted: number;
  totalFocusTime: number;
}

export interface DiaryState {
  entries: DiaryEntry[];
  tags: string[];
}

export interface DiarySettings {
  autoLogTaskCompletion: boolean;
  autoLogPomodoroSummary: boolean;
  showMoodPromptOnOpen: boolean;
  defaultEntryType: DiaryEntryType;
}

export interface MoodConfig {
  emoji: MoodEmoji;
  label: string;
  color: string;
}

export const MOOD_CONFIG: Record<MoodLevel, MoodConfig> = {
  1: { emoji: "😢", label: "Very Bad", color: "#ef4444" },
  2: { emoji: "😕", label: "Bad", color: "#f97316" },
  3: { emoji: "😐", label: "Neutral", color: "#eab308" },
  4: { emoji: "🙂", label: "Good", color: "#22c55e" },
  5: { emoji: "😄", label: "Excellent", color: "#3b82f6" }
};

export const MOOD_LEVELS: MoodLevel[] = [1, 2, 3, 4, 5];

export const ENTRY_TYPE_CONFIG: Record<DiaryEntryType, { icon: string; label: string }> = {
  note: { icon: "📝", label: "Note" },
  event: { icon: "📅", label: "Event" },
  mood: { icon: "😊", label: "Mood" },
  "task-created": { icon: "✅", label: "Task Created" },
  "task-completed": { icon: "✔️", label: "Task Completed" },
  "pomodoro-summary": { icon: "🍅", label: "Pomodoro Summary" }
};

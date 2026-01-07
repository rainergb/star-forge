export interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskReminder {
  date: number;
  label: string;
}

export interface TaskFile {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

export interface TaskNote {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type RepeatType = "daily" | "weekly" | "monthly" | "yearly" | null;

export interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  favorite: boolean;
  createdAt: number;
  steps: TaskStep[];
  dueDate: number | null;
  reminder: TaskReminder | null;
  repeat: RepeatType;
  files: TaskFile[];
  notes: TaskNote[];
  estimatedPomodoros: number | null;
  completedPomodoros: number;
  totalTimeSpent: number;
  projectId: string | null;
}

export interface TasksState {
  tasks: Task[];
}

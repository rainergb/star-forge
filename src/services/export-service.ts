import { Task } from "@/types/task.types";
import { Project } from "@/types/project.types";
import { Skill } from "@/types/skill.types";
import { DiaryEntry } from "@/types/diary.types";
import { PomodoroSession } from "@/types/pomodoro.types";

export type ExportModule =
  | "tasks"
  | "projects"
  | "maestry"
  | "diary"
  | "pomodoro"
  | "all";

export interface ExportData {
  module: ExportModule;
  exportedAt: string;
  version: string;
  data: {
    tasks?: Task[];
    projects?: Project[];
    skills?: Skill[];
    diary?: DiaryEntry[];
    pomodoro?: PomodoroSession[];
  };
}

interface ExportOptions {
  tasks?: Task[];
  projects?: Project[];
  skills?: Skill[];
  diary?: DiaryEntry[];
  pomodoro?: PomodoroSession[];
}

const APP_VERSION = "Alpha 1.0";

function generateFilename(module: ExportModule): string {
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0];
  const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `star-forge-${module}-${dateStr}_${timeStr}.txt`;
}

function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTasks(tasks: Task[]): void {
  const exportData: ExportData = {
    module: "tasks",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: { tasks }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("tasks"));
}

export function exportProjects(projects: Project[], tasks?: Task[]): void {
  // Include tasks that belong to the exported projects
  const projectIds = new Set(projects.map((p) => p.id));
  const relatedTasks = tasks?.filter((t) => t.projectId && projectIds.has(t.projectId));

  const exportData: ExportData = {
    module: "projects",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: {
      projects,
      ...(relatedTasks && relatedTasks.length > 0 && { tasks: relatedTasks })
    }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("projects"));
}

export function exportSkills(skills: Skill[]): void {
  const exportData: ExportData = {
    module: "maestry",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: { skills }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("maestry"));
}

export function exportDiary(entries: DiaryEntry[]): void {
  const exportData: ExportData = {
    module: "diary",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: { diary: entries }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("diary"));
}

export function exportPomodoro(sessions: PomodoroSession[]): void {
  const exportData: ExportData = {
    module: "pomodoro",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: { pomodoro: sessions }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("pomodoro"));
}

export function exportAll(options: ExportOptions): void {
  const exportData: ExportData = {
    module: "all",
    exportedAt: new Date().toISOString(),
    version: APP_VERSION,
    data: {
      ...(options.tasks && { tasks: options.tasks }),
      ...(options.projects && { projects: options.projects }),
      ...(options.skills && { skills: options.skills }),
      ...(options.diary && { diary: options.diary }),
      ...(options.pomodoro && { pomodoro: options.pomodoro })
    }
  };

  const content = JSON.stringify(exportData, null, 2);
  downloadFile(content, generateFilename("all"));
}

// ============ IMPORT FUNCTIONS ============

export interface ImportResult {
  success: boolean;
  module?: ExportModule;
  message: string;
  data?: ExportData["data"];
}

function parseImportFile(content: string): ImportResult {
  try {
    const parsed = JSON.parse(content) as ExportData;

    // Validate structure
    if (!parsed.module || !parsed.data) {
      return {
        success: false,
        message: "Invalid file format: missing module or data"
      };
    }

    // Validate module type
    const validModules: ExportModule[] = [
      "tasks",
      "projects",
      "maestry",
      "diary",
      "pomodoro",
      "all"
    ];
    if (!validModules.includes(parsed.module)) {
      return {
        success: false,
        message: `Invalid module type: ${parsed.module}`
      };
    }

    return {
      success: true,
      module: parsed.module,
      message: `Successfully parsed ${parsed.module} data`,
      data: parsed.data
    };
  } catch {
    return {
      success: false,
      message: "Failed to parse file: Invalid JSON format"
    };
  }
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export async function importFromFile(file: File): Promise<ImportResult> {
  try {
    const content = await readFileContent(file);
    return parseImportFile(content);
  } catch {
    return {
      success: false,
      message: "Failed to read file"
    };
  }
}

export function validateTasksImport(data: unknown): data is Task[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "title" in item
  );
}

export function validateProjectsImport(data: unknown): data is Project[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item
  );
}

export function validateSkillsImport(data: unknown): data is Skill[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item
  );
}

export function validateDiaryImport(data: unknown): data is DiaryEntry[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "content" in item
  );
}

export function validatePomodoroImport(data: unknown): data is PomodoroSession[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "startedAt" in item
  );
}

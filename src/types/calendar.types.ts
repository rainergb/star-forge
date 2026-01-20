export type CalendarModule = "diary" | "pomodoro" | "projects" | "maestry" | "stats" | "tasks";

export interface CalendarDayIndicator {
  type: "dot" | "emoji" | "progress" | "count" | "mood";
  value: string | number;
  color?: string;
}

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  hasData: boolean;
  indicator?: CalendarDayIndicator;
  tooltip?: string;
}

export interface CalendarMonthData {
  month: string; // YYYY-MM
  days: CalendarDayData[];
  summary?: {
    totalDays: number;
    daysWithData: number;
    highlight?: string;
  };
}

export interface CalendarViewConfig {
  module: CalendarModule;
  showIndicators: boolean;
  indicatorType: CalendarDayIndicator["type"];
  expandedTitle: string;
  emptyStateMessage: string;
}

export const CALENDAR_VIEW_CONFIGS: Record<CalendarModule, CalendarViewConfig> = {
  diary: {
    module: "diary",
    showIndicators: true,
    indicatorType: "mood",
    expandedTitle: "Diary Entries",
    emptyStateMessage: "No entries for this day"
  },
  pomodoro: {
    module: "pomodoro",
    showIndicators: true,
    indicatorType: "count",
    expandedTitle: "Pomodoro Sessions",
    emptyStateMessage: "No sessions for this day"
  },
  projects: {
    module: "projects",
    showIndicators: true,
    indicatorType: "dot",
    expandedTitle: "Project Activity",
    emptyStateMessage: "No activity for this day"
  },
  maestry: {
    module: "maestry",
    showIndicators: true,
    indicatorType: "progress",
    expandedTitle: "Practice Log",
    emptyStateMessage: "No practice for this day"
  },
  stats: {
    module: "stats",
    showIndicators: true,
    indicatorType: "progress",
    expandedTitle: "Activity Overview",
    emptyStateMessage: "No activity for this day"
  },
  tasks: {
    module: "tasks",
    showIndicators: true,
    indicatorType: "count",
    expandedTitle: "Tasks",
    emptyStateMessage: "No tasks for this day"
  }
};

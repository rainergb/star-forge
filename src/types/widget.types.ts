export type WidgetPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface WidgetState {
  isVisible: boolean;
  isPinned: boolean;
  isExpanded: boolean;
  position: WidgetPosition;
}

export type WidgetType =
  | "miniTaskList"
  | "miniPomodoro"
  | "musicPlayer"
  | "miniProjectList"
  | "miniMaestryList"
  | "miniCalendar";

// Maximum number of expanded widgets allowed at once
export const MAX_EXPANDED_WIDGETS = 2;

export interface FloatingWidgetsState {
  miniTaskList: WidgetState;
  miniPomodoro: WidgetState;
  musicPlayer: WidgetState;
  miniProjectList: WidgetState;
  miniMaestryList: WidgetState;
  miniCalendar: WidgetState;
}

export const DEFAULT_WIDGET_STATE: WidgetState = {
  isVisible: true,
  isPinned: false,
  isExpanded: false,
  position: "top-left"
};

export const DEFAULT_FLOATING_WIDGETS_STATE: FloatingWidgetsState = {
  miniTaskList: { ...DEFAULT_WIDGET_STATE, position: "top-left" },
  miniPomodoro: { ...DEFAULT_WIDGET_STATE, position: "top-left", isVisible: false },
  musicPlayer: {
    ...DEFAULT_WIDGET_STATE,
    position: "bottom-right",
    isVisible: false
  },
  miniProjectList: {
    ...DEFAULT_WIDGET_STATE,
    position: "top-right",
    isVisible: false
  },
  miniMaestryList: {
    ...DEFAULT_WIDGET_STATE,
    position: "top-right",
    isVisible: false
  },
  miniCalendar: {
    ...DEFAULT_WIDGET_STATE,
    position: "top-left",
    isVisible: true
  }
};

// Helper to get all widget types as array
export const ALL_WIDGET_TYPES: WidgetType[] = [
  "miniTaskList",
  "miniPomodoro",
  "musicPlayer",
  "miniProjectList",
  "miniMaestryList",
  "miniCalendar"
];

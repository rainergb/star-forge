export type WidgetPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface WidgetState {
  isVisible: boolean;
  isPinned: boolean;
  position: WidgetPosition;
}

export type WidgetType = "miniTaskList" | "miniPomodoro" | "musicPlayer";

export interface FloatingWidgetsState {
  miniTaskList: WidgetState;
  miniPomodoro: WidgetState;
  musicPlayer: WidgetState;
}

export const DEFAULT_WIDGET_STATE: WidgetState = {
  isVisible: true,
  isPinned: false,
  position: "top-left"
};

export const DEFAULT_FLOATING_WIDGETS_STATE: FloatingWidgetsState = {
  miniTaskList: { ...DEFAULT_WIDGET_STATE, position: "top-left" },
  miniPomodoro: { ...DEFAULT_WIDGET_STATE, position: "top-left" },
  musicPlayer: { ...DEFAULT_WIDGET_STATE, position: "bottom-right", isVisible: false }
};

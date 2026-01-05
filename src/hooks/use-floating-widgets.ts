import { useLocalStorage } from "./use-local-storage";
import {
  FloatingWidgetsState,
  WidgetType,
  WidgetPosition,
  DEFAULT_FLOATING_WIDGETS_STATE,
  DEFAULT_WIDGET_STATE
} from "@/types/widget.types";

export function useFloatingWidgets() {
  const { value: widgetsState, setValue: setWidgetsState } = useLocalStorage<FloatingWidgetsState>(
    "star-habit-floating-widgets",
    DEFAULT_FLOATING_WIDGETS_STATE
  );

  // Helper to safely get widget state with fallback
  const getWidgetState = (widget: WidgetType) => {
    return widgetsState[widget] || DEFAULT_WIDGET_STATE;
  };

  const toggleVisibility = (widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: !(prev[widget]?.isVisible ?? DEFAULT_WIDGET_STATE.isVisible)
      }
    }));
  };

  const showWidget = (widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: true
      }
    }));
  };

  const hideWidget = (widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: false
      }
    }));
  };

  const togglePin = (widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isPinned: !(prev[widget]?.isPinned ?? DEFAULT_WIDGET_STATE.isPinned)
      }
    }));
  };

  const setPosition = (widget: WidgetType, position: WidgetPosition) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        position
      }
    }));
  };

  const isVisible = (widget: WidgetType): boolean => {
    return getWidgetState(widget).isVisible;
  };

  const isPinned = (widget: WidgetType): boolean => {
    return getWidgetState(widget).isPinned;
  };

  const getPosition = (widget: WidgetType): WidgetPosition => {
    return getWidgetState(widget).position || "top-left";
  };

  return {
    widgetsState,
    toggleVisibility,
    showWidget,
    hideWidget,
    togglePin,
    setPosition,
    isVisible,
    isPinned,
    getPosition
  };
}

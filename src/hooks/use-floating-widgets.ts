import { useLocalStorage } from "./use-local-storage";
import {
  FloatingWidgetsState,
  WidgetType,
  WidgetPosition,
  DEFAULT_FLOATING_WIDGETS_STATE,
  DEFAULT_WIDGET_STATE,
  ALL_WIDGET_TYPES
} from "@/types/widget.types";

/**
 * Legacy hook for floating widgets management.
 * For new code, prefer using useFloatingWidgetsContext from context/floating-widgets-context.tsx
 * which provides better stacking and expansion control.
 */
export function useFloatingWidgets() {
  const { value: widgetsState, setValue: setWidgetsState } = useLocalStorage<FloatingWidgetsState>(
    "star-habit-floating-widgets-v2",
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
        isVisible: false,
        isExpanded: false
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

  const isExpanded = (widget: WidgetType): boolean => {
    return getWidgetState(widget).isExpanded;
  };

  const getPosition = (widget: WidgetType): WidgetPosition => {
    return getWidgetState(widget).position || "top-left";
  };

  // Get widgets at a position for stacking calculation
  const getWidgetsAtPosition = (position: WidgetPosition): WidgetType[] => {
    return ALL_WIDGET_TYPES.filter(w => {
      const state = widgetsState[w] || DEFAULT_WIDGET_STATE;
      return state.isVisible && state.position === position;
    });
  };

  // Calculate stack index for a widget
  const getStackIndex = (widget: WidgetType): number => {
    const position = getPosition(widget);
    const widgetsAtPosition = getWidgetsAtPosition(position);
    
    // Sort: expanded first, then by original order
    const sorted = [...widgetsAtPosition].sort((a, b) => {
      const aExp = isExpanded(a);
      const bExp = isExpanded(b);
      if (aExp && !bExp) return -1;
      if (!aExp && bExp) return 1;
      return ALL_WIDGET_TYPES.indexOf(a) - ALL_WIDGET_TYPES.indexOf(b);
    });
    
    return sorted.indexOf(widget);
  };

  // Reset all widget positions to default
  const resetPositions = () => {
    setWidgetsState(DEFAULT_FLOATING_WIDGETS_STATE);
  };

  // Toggle expand with limit
  const toggleExpand = (widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => {
      const currentlyExpanded = prev[widget]?.isExpanded ?? false;
      
      if (currentlyExpanded) {
        // Collapse
        return {
          ...prev,
          [widget]: { ...prev[widget], isExpanded: false }
        };
      }
      
      // Count expanded
      const expandedCount = ALL_WIDGET_TYPES.filter(w => 
        prev[w]?.isVisible && prev[w]?.isExpanded
      ).length;
      
      if (expandedCount >= 2) {
        // Find oldest to collapse
        const oldest = ALL_WIDGET_TYPES.find(w => 
          prev[w]?.isVisible && prev[w]?.isExpanded
        );
        
        if (oldest) {
          return {
            ...prev,
            [oldest]: { ...prev[oldest], isExpanded: false },
            [widget]: { ...(prev[widget] || DEFAULT_WIDGET_STATE), isExpanded: true }
          };
        }
      }
      
      return {
        ...prev,
        [widget]: { ...(prev[widget] || DEFAULT_WIDGET_STATE), isExpanded: true }
      };
    });
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
    isExpanded,
    getPosition,
    getStackIndex,
    getWidgetsAtPosition,
    toggleExpand,
    resetPositions
  };
}

import { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  FloatingWidgetsState,
  WidgetType,
  WidgetPosition,
  DEFAULT_FLOATING_WIDGETS_STATE,
  DEFAULT_WIDGET_STATE,
  MAX_EXPANDED_WIDGETS,
  ALL_WIDGET_TYPES
} from "@/types/widget.types";

interface FloatingWidgetsContextValue {
  // State accessors
  isVisible: (widget: WidgetType) => boolean;
  isPinned: (widget: WidgetType) => boolean;
  isExpanded: (widget: WidgetType) => boolean;
  getPosition: (widget: WidgetType) => WidgetPosition;
  
  // Stack management
  getStackIndex: (widget: WidgetType) => number;
  getWidgetsAtPosition: (position: WidgetPosition) => WidgetType[];
  
  // Actions
  toggleVisibility: (widget: WidgetType) => void;
  showWidget: (widget: WidgetType) => void;
  hideWidget: (widget: WidgetType) => void;
  togglePin: (widget: WidgetType) => void;
  setPosition: (widget: WidgetType, position: WidgetPosition) => void;
  
  // Expansion management (max 2 expanded at a time)
  toggleExpand: (widget: WidgetType) => boolean; // Returns false if cannot expand
  canExpand: (widget: WidgetType) => boolean;
  getExpandedWidgets: () => WidgetType[];
  collapseWidget: (widget: WidgetType) => void;
  collapseAll: () => void;
  
  // Raw state for advanced use
  widgetsState: FloatingWidgetsState;
}

const FloatingWidgetsContext = createContext<FloatingWidgetsContextValue | null>(null);

interface FloatingWidgetsProviderProps {
  children: ReactNode;
}

export function FloatingWidgetsProvider({ children }: FloatingWidgetsProviderProps) {
  const { value: widgetsState, setValue: setWidgetsState } = useLocalStorage<FloatingWidgetsState>(
    "star-habit-floating-widgets-v2",
    DEFAULT_FLOATING_WIDGETS_STATE
  );

  // Helper to safely get widget state with fallback
  const getWidgetState = useCallback((widget: WidgetType) => {
    return widgetsState[widget] || DEFAULT_WIDGET_STATE;
  }, [widgetsState]);

  // Basic state accessors
  const isVisible = useCallback((widget: WidgetType): boolean => {
    return getWidgetState(widget).isVisible;
  }, [getWidgetState]);

  const isPinned = useCallback((widget: WidgetType): boolean => {
    return getWidgetState(widget).isPinned;
  }, [getWidgetState]);

  const isExpanded = useCallback((widget: WidgetType): boolean => {
    return getWidgetState(widget).isExpanded;
  }, [getWidgetState]);

  const getPosition = useCallback((widget: WidgetType): WidgetPosition => {
    return getWidgetState(widget).position || "top-left";
  }, [getWidgetState]);

  // Get all visible widgets at a specific position
  const getWidgetsAtPosition = useCallback((position: WidgetPosition): WidgetType[] => {
    return ALL_WIDGET_TYPES.filter(widget => {
      const state = getWidgetState(widget);
      return state.isVisible && state.position === position;
    });
  }, [getWidgetState]);

  // Calculate stack index for a widget (order within same position)
  const getStackIndex = useCallback((widget: WidgetType): number => {
    const position = getPosition(widget);
    const widgetsAtPosition = getWidgetsAtPosition(position);
    
    // Sort by: expanded first, then by widget order
    const sortedWidgets = widgetsAtPosition.sort((a, b) => {
      const aExpanded = isExpanded(a);
      const bExpanded = isExpanded(b);
      
      // Expanded widgets come first (they take more space)
      if (aExpanded && !bExpanded) return -1;
      if (!aExpanded && bExpanded) return 1;
      
      // Otherwise maintain original order
      return ALL_WIDGET_TYPES.indexOf(a) - ALL_WIDGET_TYPES.indexOf(b);
    });
    
    return sortedWidgets.indexOf(widget);
  }, [getPosition, getWidgetsAtPosition, isExpanded]);

  // Get all currently expanded widgets
  const getExpandedWidgets = useCallback((): WidgetType[] => {
    return ALL_WIDGET_TYPES.filter(widget => {
      const state = getWidgetState(widget);
      return state.isVisible && state.isExpanded;
    });
  }, [getWidgetState]);

  // Check if we can expand another widget
  const canExpand = useCallback((widget: WidgetType): boolean => {
    const expandedWidgets = getExpandedWidgets();
    
    // If already expanded, we can "toggle" it (collapse)
    if (isExpanded(widget)) return true;
    
    // If under the limit, allow expansion
    return expandedWidgets.length < MAX_EXPANDED_WIDGETS;
  }, [getExpandedWidgets, isExpanded]);

  // Toggle visibility
  const toggleVisibility = useCallback((widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: !(prev[widget]?.isVisible ?? DEFAULT_WIDGET_STATE.isVisible)
      }
    }));
  }, [setWidgetsState]);

  const showWidget = useCallback((widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: true
      }
    }));
  }, [setWidgetsState]);

  const hideWidget = useCallback((widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isVisible: false,
        isExpanded: false // Collapse when hiding
      }
    }));
  }, [setWidgetsState]);

  // Toggle pin
  const togglePin = useCallback((widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isPinned: !(prev[widget]?.isPinned ?? DEFAULT_WIDGET_STATE.isPinned)
      }
    }));
  }, [setWidgetsState]);

  // Set position
  const setPosition = useCallback((widget: WidgetType, position: WidgetPosition) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        position
      }
    }));
  }, [setWidgetsState]);

  // Collapse a specific widget
  const collapseWidget = useCallback((widget: WidgetType) => {
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isExpanded: false
      }
    }));
  }, [setWidgetsState]);

  // Collapse all widgets
  const collapseAll = useCallback(() => {
    setWidgetsState((prev: FloatingWidgetsState) => {
      const newState = { ...prev };
      ALL_WIDGET_TYPES.forEach(widget => {
        if (newState[widget]) {
          newState[widget] = { ...newState[widget], isExpanded: false };
        }
      });
      return newState;
    });
  }, [setWidgetsState]);

  // Toggle expand with limit enforcement
  const toggleExpand = useCallback((widget: WidgetType): boolean => {
    const currentlyExpanded = isExpanded(widget);
    
    if (currentlyExpanded) {
      // Collapsing is always allowed
      collapseWidget(widget);
      return true;
    }
    
    // Check if we can expand
    const expandedWidgets = getExpandedWidgets();
    
    if (expandedWidgets.length >= MAX_EXPANDED_WIDGETS) {
      // Auto-collapse the oldest expanded widget to make room
      const oldestExpanded = expandedWidgets[0];
      setWidgetsState((prev: FloatingWidgetsState) => ({
        ...prev,
        [oldestExpanded]: {
          ...(prev[oldestExpanded] || DEFAULT_WIDGET_STATE),
          isExpanded: false
        },
        [widget]: {
          ...(prev[widget] || DEFAULT_WIDGET_STATE),
          isExpanded: true
        }
      }));
      return true;
    }
    
    // Under limit, just expand
    setWidgetsState((prev: FloatingWidgetsState) => ({
      ...prev,
      [widget]: {
        ...(prev[widget] || DEFAULT_WIDGET_STATE),
        isExpanded: true
      }
    }));
    return true;
  }, [isExpanded, collapseWidget, getExpandedWidgets, setWidgetsState]);

  const contextValue = useMemo<FloatingWidgetsContextValue>(() => ({
    isVisible,
    isPinned,
    isExpanded,
    getPosition,
    getStackIndex,
    getWidgetsAtPosition,
    toggleVisibility,
    showWidget,
    hideWidget,
    togglePin,
    setPosition,
    toggleExpand,
    canExpand,
    getExpandedWidgets,
    collapseWidget,
    collapseAll,
    widgetsState
  }), [
    isVisible,
    isPinned,
    isExpanded,
    getPosition,
    getStackIndex,
    getWidgetsAtPosition,
    toggleVisibility,
    showWidget,
    hideWidget,
    togglePin,
    setPosition,
    toggleExpand,
    canExpand,
    getExpandedWidgets,
    collapseWidget,
    collapseAll,
    widgetsState
  ]);

  return (
    <FloatingWidgetsContext.Provider value={contextValue}>
      {children}
    </FloatingWidgetsContext.Provider>
  );
}

export function useFloatingWidgetsContext() {
  const context = useContext(FloatingWidgetsContext);
  if (!context) {
    throw new Error("useFloatingWidgetsContext must be used within FloatingWidgetsProvider");
  }
  return context;
}

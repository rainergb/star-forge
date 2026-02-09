import { useState, useCallback } from "react";
import { TaskPriority } from "@/types/task.types";

export type DateFilterOption =
  | "all"
  | "today"
  | "tomorrow"
  | "week"
  | "overdue"
  | "no-date"
  | "custom";

export interface CustomDateRange {
  start: Date | null;
  end: Date | null;
}

interface TaskFiltersState {
  projectIds: string[];
  noProject: boolean;
  priorities: TaskPriority[];
  dateFilter: DateFilterOption;
  customDateRange: CustomDateRange;
}

const DEFAULT_FILTERS: TaskFiltersState = {
  projectIds: [],
  noProject: false,
  priorities: [],
  dateFilter: "all",
  customDateRange: { start: null, end: null }
};

let globalFilters: TaskFiltersState = { ...DEFAULT_FILTERS };
let listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useTaskFilters() {
  const [, forceUpdate] = useState({});

  const subscribe = useCallback(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  useState(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  });

  const setProjectIds = useCallback((ids: string[]) => {
    globalFilters = { ...globalFilters, projectIds: ids };
    notifyListeners();
  }, []);

  const setNoProject = useCallback((value: boolean) => {
    globalFilters = { ...globalFilters, noProject: value };
    notifyListeners();
  }, []);

  const setProjectFilter = useCallback(
    (ids: string[], noProject: boolean) => {
      globalFilters = { ...globalFilters, projectIds: ids, noProject };
      notifyListeners();
    },
    []
  );

  const setPriorities = useCallback((priorities: TaskPriority[]) => {
    globalFilters = { ...globalFilters, priorities };
    notifyListeners();
  }, []);

  const setDateFilter = useCallback((filter: DateFilterOption) => {
    globalFilters = { ...globalFilters, dateFilter: filter };
    notifyListeners();
  }, []);

  const setCustomDateRange = useCallback((range: CustomDateRange) => {
    globalFilters = { ...globalFilters, customDateRange: range };
    notifyListeners();
  }, []);

  const clearFilters = useCallback(() => {
    globalFilters = { ...DEFAULT_FILTERS };
    notifyListeners();
  }, []);

  const hasActiveFilter =
    globalFilters.projectIds.length > 0 ||
    globalFilters.noProject ||
    globalFilters.priorities.length > 0 ||
    globalFilters.dateFilter !== "all";

  return {
    filters: globalFilters,
    projectIds: globalFilters.projectIds,
    noProject: globalFilters.noProject,
    priorities: globalFilters.priorities,
    dateFilter: globalFilters.dateFilter,
    customDateRange: globalFilters.customDateRange,
    hasActiveFilter,
    setProjectIds,
    setNoProject,
    setProjectFilter,
    setPriorities,
    setDateFilter,
    setCustomDateRange,
    clearFilters
  };
}

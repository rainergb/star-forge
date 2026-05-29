import { useState, useCallback } from "react";
import { LayoutList, Flag, ListChecks, CalendarDays, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TaskSortKey = "default" | "priority" | "steps" | "due-date" | "worked";

export const TASK_SORT_LABELS: Record<TaskSortKey, string> = {
  default:    "Default",
  priority:   "Priority",
  steps:      "Most steps",
  "due-date": "Due date",
  worked:     "Most worked"
};

export const TASK_SORT_ICONS: Record<TaskSortKey, LucideIcon> = {
  default:    LayoutList,
  priority:   Flag,
  steps:      ListChecks,
  "due-date": CalendarDays,
  worked:     Timer
};

// ─── Estado global — persiste entre expanded ↔ collapsed ─────────────────────
let _sort: TaskSortKey = "default";
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach((l) => l()); }

export function useTaskSort() {
  const [, forceUpdate] = useState({});

  useState(() => {
    const listener = () => forceUpdate({});
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  });

  const setSortKey = useCallback((key: TaskSortKey) => {
    _sort = key;
    notify();
  }, []);

  return { sortKey: _sort, setSortKey };
}

import { useState, useCallback } from "react";
import { LayoutList, Timer, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProjectSortKey = "default" | "hours" | "open-tasks";

export const PROJECT_SORT_LABELS: Record<ProjectSortKey, string> = {
  default:      "Default",
  hours:        "Most hours",
  "open-tasks": "Open tasks"
};

export const PROJECT_SORT_ICONS: Record<ProjectSortKey, LucideIcon> = {
  default:      LayoutList,
  hours:        Timer,
  "open-tasks": ListTodo
};

// ─── Estado global — persiste entre expanded ↔ collapsed ─────────────────────
let _sort: ProjectSortKey = "default";
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach((l) => l()); }

export function useProjectSort() {
  const [, forceUpdate] = useState({});

  useState(() => {
    const listener = () => forceUpdate({});
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  });

  const setSortKey = useCallback((key: ProjectSortKey) => {
    _sort = key;
    notify();
  }, []);

  return { sortKey: _sort, setSortKey };
}

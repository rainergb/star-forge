import { useState, useCallback } from "react";
import { Zap, Pause, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProjectStatus } from "@/types/project.types";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active:    "Active",
  paused:    "Paused",
  completed: "Completed"
};

export const PROJECT_STATUS_ICONS: Record<ProjectStatus, LucideIcon> = {
  active:    Zap,
  paused:    Pause,
  completed: CheckCircle2
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = ["active", "paused", "completed"];

// ─── Estado global — persiste entre expanded ↔ collapsed ─────────────────────
// Set vazio = sem filtro (mostra todos os status).
let _statuses: ProjectStatus[] = [];
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach((l) => l()); }

export function useProjectStatusFilter() {
  const [, forceUpdate] = useState({});

  useState(() => {
    const listener = () => forceUpdate({});
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  });

  const toggleStatus = useCallback((status: ProjectStatus) => {
    _statuses = _statuses.includes(status)
      ? _statuses.filter((s) => s !== status)
      : [..._statuses, status];
    notify();
  }, []);

  return { statuses: _statuses, toggleStatus };
}

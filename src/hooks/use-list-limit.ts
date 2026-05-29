import { useCallback, useState } from "react";

export type LimitValue = number | null; // null = "all"

const STORAGE_PREFIX = "star-habit-list-limit-";

/**
 * Persiste o limite de exibição de itens por módulo no localStorage.
 * @param moduleKey identificador único do módulo (ex: "tasks", "skills")
 * @param defaultLimit padrão quando não há valor salvo (default 20)
 */
export function useListLimit(moduleKey: string, defaultLimit: number = 20) {
  const storageKey = `${STORAGE_PREFIX}${moduleKey}`;

  const [limit, setLimitState] = useState<LimitValue>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return defaultLimit;
      if (raw === "null") return null;
      const parsed = parseInt(raw, 10);
      return Number.isFinite(parsed) ? parsed : defaultLimit;
    } catch {
      return defaultLimit;
    }
  });

  const setLimit = useCallback(
    (newLimit: LimitValue) => {
      setLimitState(newLimit);
      try {
        localStorage.setItem(
          storageKey,
          newLimit === null ? "null" : String(newLimit)
        );
      } catch {}
    },
    [storageKey]
  );

  return { limit, setLimit };
}

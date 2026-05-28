import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  readLocalData,
  hasLocalData,
  getSummary,
  migrateToSupabase,
  clearLocalData,
  LocalData,
  MigrationSummary
} from "@/services/migration.service";

export type { MigrationSummary };

const MIGRATED_KEY_PREFIX = "star-habit-migrated-";

export type MigrationStatus = "idle" | "pending" | "migrating" | "success" | "error";

export function useMigration() {
  const { user, isGuest, isAuthenticated } = useAuth();

  const [status, setStatus] = useState<MigrationStatus>("idle");
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const checkedRef = useRef<string | null>(null);

  // Detecta dados locais ao autenticar
  useEffect(() => {
    if (!isAuthenticated || isGuest || !user?.id) return;
    if (checkedRef.current === user.id) return;
    checkedRef.current = user.id;

    const migratedKey = `${MIGRATED_KEY_PREFIX}${user.id}`;
    if (localStorage.getItem(migratedKey)) return;

    const data = readLocalData();
    if (hasLocalData(data)) {
      setLocalData(data);
      setSummary(getSummary(data));
      setStatus("pending");
    }
  }, [isAuthenticated, isGuest, user?.id]);

  const migrate = async () => {
    if (!localData || !user?.id) return;

    setStatus("migrating");
    setErrorMsg(null);

    try {
      await migrateToSupabase(user.id, localData);
      localStorage.setItem(`${MIGRATED_KEY_PREFIX}${user.id}`, "1");
      clearLocalData();
      setStatus("success");
    } catch (err: any) {
      console.error("[useMigration]", err);
      setErrorMsg(err?.message ?? "Unknown error");
      setStatus("error");
    }
  };

  const skip = () => {
    if (!user?.id) return;
    // Marca como "o usuário optou por não migrar" — não pergunta novamente
    localStorage.setItem(`${MIGRATED_KEY_PREFIX}${user.id}`, "skipped");
    setStatus("idle");
  };

  const dismiss = () => setStatus("idle");

  return {
    showModal: status === "pending" || status === "migrating" || status === "success" || status === "error",
    status,
    summary,
    errorMsg,
    migrate,
    skip,
    dismiss
  };
}

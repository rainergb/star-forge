import { useState, useEffect } from "react";
import { CURRENT_VERSION, CHANGELOG } from "@/data/changelog";
import type { ChangelogEntry } from "@/data/changelog";

const STORAGE_KEY = "star-habit-last-seen-version";

interface UseWhatsNewResult {
  show: boolean;
  entry: ChangelogEntry | null;
  dismiss: () => void;
}

export function useWhatsNew(): UseWhatsNewResult {
  const [show, setShow] = useState(false);

  const entry = CHANGELOG.find((c) => c.version === CURRENT_VERSION) ?? null;

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);

    if (!lastSeen) {
      // Primeira instalação: salva a versão atual sem mostrar o modal.
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
      return;
    }

    if (lastSeen === CURRENT_VERSION) return;

    // Versão diferente da última vista → mostra modal de novidades.
    setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setShow(false);
  };

  return { show, entry, dismiss };
}

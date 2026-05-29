import { useEffect, useRef } from "react";
import { usePersonalize } from "@/hooks/use-personalize";

/**
 * Sincroniza a preferência "Abrir ao iniciar o PC" com o sistema operacional via Electron.
 * No primeiro carregamento, aplica o valor salvo (default: true).
 * Quando o usuário muda no UI, propaga para o Electron.
 */
export function useAutoStart() {
  const { settings } = usePersonalize();
  const lastAppliedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.setLoginItem) return;

    // Evita re-aplicar o mesmo valor repetidamente
    if (lastAppliedRef.current === settings.openAtLogin) return;
    lastAppliedRef.current = settings.openAtLogin;

    electronAPI.setLoginItem(settings.openAtLogin).catch((err: Error) => {
      console.error("[useAutoStart] failed to set login item:", err);
    });
  }, [settings.openAtLogin]);
}

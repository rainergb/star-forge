import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PersonalizeSettings } from "@/content/config/personalize-config";

const STORAGE_KEY = "star-forge-personalize";

const defaultSettings: PersonalizeSettings = {
  showBg: true,
  showTest: false,
};

export function usePersonalize() {
  const { value: settings, setValue: setSettings } = useLocalStorage<PersonalizeSettings>(
    STORAGE_KEY,
    defaultSettings
  );

  const saveSettings = useCallback(
    (newSettings: PersonalizeSettings) => {
      setSettings(newSettings);
    },
    [setSettings]
  );

  return {
    settings,
    saveSettings,
  };
}

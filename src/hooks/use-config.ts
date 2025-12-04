import { useCallback, useEffect } from "react";
import { configService } from "@/services/config-service";
import { TimerSettings } from "@/content/config/timer-config";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";

const STORAGE_KEY = "star-forge-settings";

const defaultSettings: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4
};

export function useConfig() {
  const { toast } = useToast();
  const { value: settings, setValue: setSettings } =
    useLocalStorage<TimerSettings>(STORAGE_KEY, defaultSettings);

  useEffect(() => {
    const loadFromFile = async () => {
      try {
        const data = await configService.getConfig();
        if (data) {
          const fileSettings: TimerSettings = {
            pomodoro: Math.floor(data.stageSeconds[0] / 60),
            shortBreak: Math.floor(data.stageSeconds[1] / 60),
            longBreak: Math.floor(data.stageSeconds[2] / 60),
            autoStartBreaks: data.autoStartEnabled,
            autoStartPomodoros: data.autoStartPomodoroEnabled,
            longBreakInterval: data.longBreakInterval
          };
          setSettings(fileSettings);
        }
      } catch (error) {}
    };

    loadFromFile();
  }, []);

  const saveSettings = useCallback(
    async (newSettings: TimerSettings) => {
      try {
        setSettings(newSettings);

        if (window.electronAPI) {
          const timeout = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Request timed out after 5s")),
              5000
            )
          );

          await Promise.race([configService.saveConfig(newSettings), timeout]);
        }

        toast({
          title: "Settings saved",
          description: "Your changes have been successfully saved.",
          duration: 2000,
          variant: "success"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save settings to file.",
          variant: "destructive",
          duration: 2000
        });
      }
    },
    [setSettings, toast]
  );

  return {
    settings,
    isLoading: false,
    saveSettings,
    isSaving: false
  };
}

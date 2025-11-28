import { TimerSettings } from "@/content/config/timer-config";

export interface BackendConfig {
  stageSeconds: [number, number, number];
  autoStartEnabled: boolean;
  autoStartPomodoroEnabled: boolean;
  longBreakInterval: number;
}

export const configService = {
  saveConfig: async (settings: TimerSettings) => {
    const backendConfig: BackendConfig = {
      stageSeconds: [
        settings.pomodoro * 60,
        settings.shortBreak * 60,
        settings.longBreak * 60
      ],
      autoStartEnabled: settings.autoStartBreaks,
      autoStartPomodoroEnabled: settings.autoStartPomodoros,
      longBreakInterval: settings.longBreakInterval
    };

    if (window.electronAPI) {
      try {
        const response = await window.electronAPI.request("PUT", "/config", backendConfig);
        return response;
      } catch (error) {
        throw error;
      }
    } else {
      return { success: false, error: "Electron API not available" };
    }
  },

  getConfig: async (): Promise<BackendConfig | null> => {
    if (window.electronAPI) {
      const result = await window.electronAPI.request("GET", "/config");
      if (result.success && result.data) {
        return result.data;
      }
    }
    return null;
  }
};

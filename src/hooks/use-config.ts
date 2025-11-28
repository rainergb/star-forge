import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { configService } from "@/services/config-service";
import { TimerSettings } from "@/content/config/timer-config";
import { useToast } from "@/hooks/use-toast";

const CONFIG_QUERY_KEY = ["config"];

const defaultSettings: TimerSettings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  longBreakInterval: 4,
};

export function useConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: async () => {
      const data = await configService.getConfig();
      if (!data) return defaultSettings;

      return {
        pomodoro: Math.floor(data.stageSeconds[0] / 60),
        shortBreak: Math.floor(data.stageSeconds[1] / 60),
        longBreak: Math.floor(data.stageSeconds[2] / 60),
        autoStartBreaks: data.autoStartEnabled,
        autoStartPomodoros: data.autoStartPomodoroEnabled,
        longBreakInterval: data.longBreakInterval,
      } as TimerSettings;
    },
    initialData: defaultSettings,
  });

  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async (newSettings: TimerSettings) => {
      try {
        // Add timeout to detect hanging requests
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out after 5s")), 5000)
        );

        const result = await Promise.race([
          configService.saveConfig(newSettings),
          timeout,
        ]);

        return result;
      } catch (e) {
        throw e;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
      toast({
        title: "Settings saved",
        description: "Your changes have been successfully saved.",
        duration: 2000,
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  return {
    settings,
    isLoading,
    saveSettings,
    isSaving
  };
}

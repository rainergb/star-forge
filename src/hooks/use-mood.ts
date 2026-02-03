import { useCallback, useMemo } from "react";
import {
  MoodLevel,
  MoodEmoji,
  MoodEntry,
  MoodConfig,
  MOOD_CONFIG,
  MOOD_LEVELS
} from "@/types/diary.types";

export function useMood() {
  const getMoodConfig = useCallback((level: MoodLevel): MoodConfig => {
    return MOOD_CONFIG[level];
  }, []);

  const getMoodEmoji = useCallback((level: MoodLevel): MoodEmoji => {
    return MOOD_CONFIG[level].emoji;
  }, []);

  const getMoodLabel = useCallback((level: MoodLevel): string => {
    return MOOD_CONFIG[level].label;
  }, []);

  const getMoodColor = useCallback((level: MoodLevel): string => {
    return MOOD_CONFIG[level].color;
  }, []);

  const createMoodEntry = useCallback(
    (level: MoodLevel, note?: string): MoodEntry => {
      return {
        level,
        emoji: MOOD_CONFIG[level].emoji,
        note: note ?? null,
        emotions: []
      };
    },
    []
  );

  const getMoodFromAverage = useCallback((average: number): MoodLevel => {
    const rounded = Math.round(average);
    return Math.max(1, Math.min(5, rounded)) as MoodLevel;
  }, []);

  const getColorForAverage = useCallback((average: number | null): string => {
    if (average === null) return "transparent";
    const level = Math.round(average) as MoodLevel;
    const validLevel = Math.max(1, Math.min(5, level)) as MoodLevel;
    return MOOD_CONFIG[validLevel].color;
  }, []);

  const getEmojiForAverage = useCallback(
    (average: number | null): MoodEmoji | null => {
      if (average === null) return null;
      const level = Math.round(average) as MoodLevel;
      const validLevel = Math.max(1, Math.min(5, level)) as MoodLevel;
      return MOOD_CONFIG[validLevel].emoji;
    },
    []
  );

  const moodOptions = useMemo(() => {
    return MOOD_LEVELS.map((level) => ({
      level,
      ...MOOD_CONFIG[level]
    }));
  }, []);

  const calculateMoodTrend = useCallback(
    (
      moodValues: number[]
    ): "improving" | "stable" | "declining" => {
      if (moodValues.length < 2) return "stable";

      const midpoint = Math.floor(moodValues.length / 2);
      const firstHalf = moodValues.slice(0, midpoint);
      const secondHalf = moodValues.slice(midpoint);

      const firstAvg =
        firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      const diff = secondAvg - firstAvg;

      if (diff > 0.3) return "improving";
      if (diff < -0.3) return "declining";
      return "stable";
    },
    []
  );

  const formatMoodDisplay = useCallback(
    (mood: MoodEntry | null): string => {
      if (!mood) return "";
      return `${mood.emoji} ${MOOD_CONFIG[mood.level].label}`;
    },
    []
  );

  return {
    getMoodConfig,
    getMoodEmoji,
    getMoodLabel,
    getMoodColor,
    createMoodEntry,
    getMoodFromAverage,
    getColorForAverage,
    getEmojiForAverage,
    moodOptions,
    calculateMoodTrend,
    formatMoodDisplay,
    MOOD_CONFIG,
    MOOD_LEVELS
  };
}

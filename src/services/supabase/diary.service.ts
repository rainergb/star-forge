import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type DiaryEntry = Database["public"]["Tables"]["diary_entries"]["Row"];
type DiaryEntryInsert = Database["public"]["Tables"]["diary_entries"]["Insert"];
type DiaryEntryUpdate = Database["public"]["Tables"]["diary_entries"]["Update"];

type Mood = "very_bad" | "bad" | "neutral" | "good" | "very_good";

export const diaryService = {
  /**
   * Get all diary entries for current user
   */
  async getEntries(userId: string) {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data as DiaryEntry[];
  },

  /**
   * Get diary entries for a date range
   */
  async getEntriesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) throw error;
    return data as DiaryEntry[];
  },

  /**
   * Get entry for a specific date
   */
  async getEntryByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as DiaryEntry | null;
  },

  /**
   * Get entries by mood
   */
  async getEntriesByMood(userId: string, mood: Mood) {
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("mood", mood)
      .order("date", { ascending: false });

    if (error) throw error;
    return data as DiaryEntry[];
  },

  /**
   * Create a new diary entry
   */
  async createEntry(entry: DiaryEntryInsert) {
    const { data, error } = await supabase
      .from("diary_entries")
      .insert([entry])
      .select()
      .single();

    if (error) throw error;
    return data as DiaryEntry;
  },

  /**
   * Update a diary entry
   */
  async updateEntry(id: string, updates: DiaryEntryUpdate) {
    const { data, error } = await supabase
      .from("diary_entries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as DiaryEntry;
  },

  /**
   * Delete a diary entry
   */
  async deleteEntry(id: string) {
    const { error } = await supabase
      .from("diary_entries")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Get mood statistics for a period
   */
  async getMoodStats(userId: string, startDate: string, endDate: string) {
    const entries = await diaryService.getEntriesByDateRange(
      userId,
      startDate,
      endDate
    );

    const moods: Record<string, number> = {
      very_bad: 0,
      bad: 0,
      neutral: 0,
      good: 0,
      very_good: 0,
      null: 0
    };

    entries.forEach((entry) => {
      if (entry.mood && entry.mood in moods) {
        moods[entry.mood]++;
      } else {
        moods["null"]++;
      }
    });

    return moods;
  }
};

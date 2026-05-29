import { supabase } from "@/lib/supabase";

export interface UserStreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null; // YYYY-MM-DD
  updated_at: string;
}

export const streakService = {
  async getStreak(userId: string): Promise<UserStreakRow | null> {
    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      // Tabela ainda não existe (42P01) — retorna null silenciosamente
      if (
        (error as any).code === "42P01" ||
        (error as any).code === "PGRST200" ||
        String((error as any).message).includes("does not exist")
      ) {
        return null;
      }
      throw error;
    }
    return (data as UserStreakRow | null) ?? null;
  },

  async upsertStreak(
    userId: string,
    update: {
      current_streak: number;
      longest_streak: number;
      last_activity_date: string;
    }
  ): Promise<UserStreakRow | null> {
    const { data, error } = await supabase
      .from("user_streaks")
      .upsert(
        {
          user_id: userId,
          ...update,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    if (error) {
      // Tabela ainda não existe — falha silenciosa
      if (
        (error as any).code === "42P01" ||
        (error as any).code === "PGRST200" ||
        String((error as any).message).includes("does not exist")
      ) {
        return null;
      }
      throw error;
    }
    return data as UserStreakRow;
  }
};

import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type PomodoroSession = Database["public"]["Tables"]["pomodoro_sessions"]["Row"];
type PomodoroInsert = Database["public"]["Tables"]["pomodoro_sessions"]["Insert"];
type PomodoroUpdate = Database["public"]["Tables"]["pomodoro_sessions"]["Update"];

export const pomodoroService = {
  /**
   * Get all pomodoro sessions for current user
   */
  async getSessions(userId: string) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data as PomodoroSession[];
  },

  /**
   * Get completed sessions
   */
  async getCompletedSessions(userId: string) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data as PomodoroSession[];
  },

  /**
   * Get sessions for a task
   */
  async getTaskSessions(taskId: string) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("task_id", taskId)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data as PomodoroSession[];
  },

  /**
   * Get sessions by date range
   */
  async getSessionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("started_at", startDate)
      .lte("started_at", endDate)
      .order("started_at", { ascending: false });

    if (error) throw error;
    return data as PomodoroSession[];
  },

  /**
   * Create a new pomodoro session
   */
  async createSession(session: PomodoroInsert) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    return data as PomodoroSession;
  },

  /**
   * Update a pomodoro session
   */
  async updateSession(id: string, updates: PomodoroUpdate) {
    const { data, error } = await supabase
      .from("pomodoro_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as PomodoroSession;
  },

  /**
   * Complete a pomodoro session
   */
  async completeSession(id: string) {
    return pomodoroService.updateSession(id, { completed: true });
  },

  /**
   * Delete a pomodoro session
   */
  async deleteSession(id: string) {
    const { error } = await supabase
      .from("pomodoro_sessions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Get total time spent in pomodoro sessions
   */
  async getTotalTimeSpent(userId: string) {
    const sessions = await pomodoroService.getSessions(userId);
    return sessions.reduce((acc, session) => acc + session.duration, 0);
  },

  /**
   * Get today's statistics
   */
  async getTodayStats(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const sessions = await pomodoroService.getSessionsByDateRange(
      userId,
      today + "T00:00:00Z",
      tomorrow + "T00:00:00Z"
    );

    const completed = sessions.filter((s) => s.completed).length;
    const workSessions = sessions.filter((s) => s.mode === "work").length;
    const breakSessions = sessions.filter((s) => s.mode === "shortBreak" || s.mode === "longBreak").length;
    const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0);

    return {
      total: sessions.length,
      completed,
      workSessions,
      breakSessions,
      totalTime
    };
  },

  /**
   * Get weekly statistics
   */
  async getWeeklyStats(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const startDate = weekAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const sessions = await pomodoroService.getSessionsByDateRange(
      userId,
      startDate + "T00:00:00Z",
      endDate + "T23:59:59Z"
    );

    const completed = sessions.filter((s) => s.completed).length;
    const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0);

    return {
      total: sessions.length,
      completed,
      totalTime,
      averageSessionLength: sessions.length > 0 ? totalTime / sessions.length : 0
    };
  }
};

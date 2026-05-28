import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export const tasksService = {
  /**
   * Get all tasks for current user
   */
  async getTasks(userId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  /**
   * Get tasks by project
   */
  async getTasksByProject(userId: string, projectId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  /**
   * Get completed tasks
   */
  async getCompletedTasks(userId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data as Task[];
  },

  /**
   * Get pending tasks
   */
  async getPendingTasks(userId: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("completed", false)
      .order("due_date", { ascending: true });

    if (error) throw error;
    return data as Task[];
  },

  /**
   * Create a new task
   */
  async createTask(task: TaskInsert) {
    const { data, error } = await supabase
      .from("tasks")
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Update a task
   */
  async updateTask(id: string, updates: TaskUpdate) {
    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(id: string, completed: boolean) {
    return tasksService.updateTask(id, { 
      completed,
      updated_at: new Date().toISOString()
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Bulk delete tasks
   */
  async deleteTasks(ids: string[]) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .in("id", ids);

    if (error) throw error;
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: string) {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Task;
  }
};

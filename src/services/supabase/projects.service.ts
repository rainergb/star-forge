import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export const projectsService = {
  /**
   * Get all projects for current user
   */
  async getProjects(userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Get active projects only
   */
  async getActiveProjects(userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Get completed projects
   */
  async getCompletedProjects(userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Create a new project
   */
  async createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from("projects")
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  /**
   * Update a project
   */
  async updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Get project by ID
   */
  async getProjectById(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  /**
   * Update project total time spent
   */
  async updateProjectTimeSpent(id: string, duration: number) {
    const project = await projectsService.getProjectById(id);
    return projectsService.updateProject(id, {
      total_time_spent: project.total_time_spent + duration
    });
  }
};

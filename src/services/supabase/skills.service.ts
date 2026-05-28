import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type Skill = Database["public"]["Tables"]["skills"]["Row"];
type SkillInsert = Database["public"]["Tables"]["skills"]["Insert"];
type SkillUpdate = Database["public"]["Tables"]["skills"]["Update"];

export const skillsService = {
  /**
   * Get all skills for current user
   */
  async getSkills(userId: string) {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", userId)
      .order("current_level", { ascending: false });

    if (error) throw error;
    return data as Skill[];
  },

  /**
   * Get skill by ID
   */
  async getSkillById(id: string) {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Skill;
  },

  /**
   * Create a new skill
   */
  async createSkill(skill: SkillInsert) {
    const { data, error } = await supabase
      .from("skills")
      .insert([skill])
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  },

  /**
   * Update a skill
   */
  async updateSkill(id: string, updates: SkillUpdate) {
    const { data, error } = await supabase
      .from("skills")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Skill;
  },

  /**
   * Increase skill level
   */
  async increaseSkillLevel(id: string, amount: number = 1) {
    const skill = await skillsService.getSkillById(id);
    return skillsService.updateSkill(id, {
      current_level: skill.current_level + amount
    });
  },

  /**
   * Update skill time spent
   */
  async updateSkillTimeSpent(id: string, duration: number) {
    const skill = await skillsService.getSkillById(id);
    return skillsService.updateSkill(id, {
      total_time_spent: skill.total_time_spent + duration
    });
  },

  /**
   * Delete a skill
   */
  async deleteSkill(id: string) {
    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          completed: boolean
          priority: "low" | "medium" | "high" | null
          due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          // Campos ricos
          category: string
          favorite: boolean
          image: string | null
          steps: Json
          reminder: Json | null
          repeat: string | null
          repeat_days: Json
          files: Json
          task_notes: Json
          estimated_pomodoros: number | null
          completed_pomodoros: number
          total_time_spent: number
          skill_ids: Json
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          completed?: boolean
          priority?: "low" | "medium" | "high" | null
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          // Campos ricos
          category?: string
          favorite?: boolean
          image?: string | null
          steps?: Json
          reminder?: Json | null
          repeat?: string | null
          repeat_days?: Json
          files?: Json
          task_notes?: Json
          estimated_pomodoros?: number | null
          completed_pomodoros?: number
          total_time_spent?: number
          skill_ids?: Json
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          completed?: boolean
          priority?: "low" | "medium" | "high" | null
          due_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          // Campos ricos
          category?: string
          favorite?: boolean
          image?: string | null
          steps?: Json
          reminder?: Json | null
          repeat?: string | null
          repeat_days?: Json
          files?: Json
          task_notes?: Json
          estimated_pomodoros?: number | null
          completed_pomodoros?: number
          total_time_spent?: number
          skill_ids?: Json
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          status: "active" | "paused" | "completed"
          color: string | null
          description: string | null
          total_time_spent: number
          created_at: string
          // Campos ricos
          icon: Json
          image: string | null
          favorite: boolean
          due_date: string | null
          estimated_pomodoros: number | null
          completed_pomodoros: number
          sort_order: number
          updated_at: string
          project_notes: Json
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          status?: "active" | "paused" | "completed"
          color?: string | null
          description?: string | null
          total_time_spent?: number
          created_at?: string
          // Campos ricos
          icon?: Json
          image?: string | null
          favorite?: boolean
          due_date?: string | null
          estimated_pomodoros?: number | null
          completed_pomodoros?: number
          sort_order?: number
          updated_at?: string
          project_notes?: Json
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          status?: "active" | "paused" | "completed"
          color?: string | null
          description?: string | null
          total_time_spent?: number
          created_at?: string
          // Campos ricos
          icon?: Json
          image?: string | null
          favorite?: boolean
          due_date?: string | null
          estimated_pomodoros?: number | null
          completed_pomodoros?: number
          sort_order?: number
          updated_at?: string
          project_notes?: Json
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          current_level: number
          total_time_spent: number
          created_at: string
          // Campos ricos
          description: string | null
          color: string
          icon: Json
          image: string | null
          total_pomodoros: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          current_level?: number
          total_time_spent?: number
          created_at?: string
          // Campos ricos
          description?: string | null
          color?: string
          icon?: Json
          image?: string | null
          total_pomodoros?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          current_level?: number
          total_time_spent?: number
          created_at?: string
          // Campos ricos
          description?: string | null
          color?: string
          icon?: Json
          image?: string | null
          total_pomodoros?: number
          updated_at?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          content: string
          mood: string | null
          created_at: string
          // Campos ricos
          entry_type: string
          time: string | null
          image: string | null
          mood_entry: Json | null
          linked_task_id: string | null
          tags: Json
          favorite: boolean
          files: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          content: string
          mood?: string | null
          created_at?: string
          // Campos ricos
          entry_type?: string
          time?: string | null
          image?: string | null
          mood_entry?: Json | null
          linked_task_id?: string | null
          tags?: Json
          favorite?: boolean
          files?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          content?: string
          mood?: string | null
          created_at?: string
          // Campos ricos
          entry_type?: string
          time?: string | null
          image?: string | null
          mood_entry?: Json | null
          linked_task_id?: string | null
          tags?: Json
          favorite?: boolean
          files?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          started_at: string
          duration: number
          mode: "work" | "shortBreak" | "longBreak"
          completed: boolean
          created_at: string
          // Campos ricos
          task_title: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          started_at: string
          duration: number
          mode: "work" | "shortBreak" | "longBreak"
          completed?: boolean
          created_at?: string
          // Campos ricos
          task_title?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          started_at?: string
          duration?: number
          mode?: "work" | "shortBreak" | "longBreak"
          completed?: boolean
          created_at?: string
          // Campos ricos
          task_title?: string | null
          ended_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

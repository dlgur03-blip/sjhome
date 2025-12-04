export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          is_published: boolean;
          sequence: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_published?: boolean;
          sequence?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_published?: boolean;
          sequence?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          video_id: string;
          duration: number;
          sequence: number;
          is_free: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          video_id: string;
          duration?: number;
          sequence?: number;
          is_free?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          video_id?: string;
          duration?: number;
          sequence?: number;
          is_free?: boolean;
          created_at?: string;
        };
      };
      license_keys: {
        Row: {
          id: string;
          key: string;
          expires_at: string;
          is_active: boolean;
          current_device_id: string | null;
          last_accessed_at: string | null;
          memo: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          expires_at: string;
          is_active?: boolean;
          current_device_id?: string | null;
          last_accessed_at?: string | null;
          memo?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          expires_at?: string;
          is_active?: boolean;
          current_device_id?: string | null;
          last_accessed_at?: string | null;
          memo?: string | null;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          license_key_id: string;
          lesson_id: string;
          is_completed: boolean;
          watch_seconds: number;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          license_key_id: string;
          lesson_id: string;
          is_completed?: boolean;
          watch_seconds?: number;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          license_key_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          watch_seconds?: number;
          last_watched_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          username: string;
          password: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

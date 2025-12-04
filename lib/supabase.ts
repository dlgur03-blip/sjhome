import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 싱글톤 인스턴스
let client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!client) {
    client = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export function createClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 싱글톤 인스턴스
let client: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (!client) {
    client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
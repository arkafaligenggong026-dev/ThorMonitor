import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://diugjvrakvmonlpfhqwq.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_eBgJSGeWY7I5Qw8CNcbrug_gXeSkfsi";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
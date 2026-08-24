import { createClient } from "@/lib/supabase/server";
import type { DashboardStats, Profile, WorkOrder } from "@/lib/types";

export async function getCurrentUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile: profile ?? null };
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("work_orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as WorkOrder[]) ?? [];
}

export async function getWorkOrder(id: string): Promise<WorkOrder | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("work_orders").select("*").eq("id", id).single();
  return (data as WorkOrder) ?? null;
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("nama_lengkap");
  return (data as Profile[]) ?? [];
}

export async function getProfilesMap(): Promise<Record<string, Profile>> {
  const profiles = await getAllProfiles();
  return Object.fromEntries(profiles.map((p) => [p.id, p]));
}

export function hitungStats(workOrders: WorkOrder[]): DashboardStats {
  return {
    total: workOrders.length,
    open: workOrders.filter((w) => w.status === "open").length,
    assigned: workOrders.filter((w) => w.status === "assigned").length,
    in_progress: workOrders.filter((w) => w.status === "in_progress").length,
    resolved: workOrders.filter((w) => w.status === "resolved").length,
    closed: workOrders.filter((w) => w.status === "closed").length,
  };
}

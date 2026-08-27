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

// 🔥 FUNGSI INI SEKARANG JADI SUPER PINTAR (GEOFENCING + ROLE FILTER)
export async function getWorkOrders(): Promise<WorkOrder[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data } = await supabase
    .from("work_orders")
    .select("*")
    .order("created_at", { ascending: false });

  let allOrders = (data as WorkOrder[]) ?? [];

  if (user) {
    // 🌟 PERBAIKAN: Sekarang kita narik "ulp" DAN "role" sekaligus
    const { data: profile } = await supabase
      .from("profiles")
      .select("ulp, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      // 1. LOGIKA GEOFENCING (KANTOR)
      // Jika BUKAN orang UP3 Manado (Induk), saring data khusus ULP dia saja.
      if (profile.ulp !== "UP3 Manado") {
        allOrders = allOrders.filter(
          (w) => w.asal_kantor && w.asal_kantor === profile.ulp
        );
      }

      // 2. LOGIKA HAK AKSES QA & ROW (ROLE)
      // Jika BUKAN Pegawai dan BUKAN Tim Rabas, sembunyikan semua laporan QA/ROW!
      const canSeeQA = profile.role === "supervisor" || profile.role === "tim_rabas";
      if (!canSeeQA) {
        allOrders = allOrders.filter((w) => w.kategori !== "ROW");
      }
    }
  }

  return allOrders;
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
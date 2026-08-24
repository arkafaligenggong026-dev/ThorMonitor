import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/data";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile();

  // Jaring pengaman tambahan di luar middleware (mis. saat pengembangan lokal).
  if (!user || !profile) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <SidebarNav nama={profile.nama_lengkap} role={profile.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar nama={profile.nama_lengkap} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUserAndProfile } from "@/lib/data";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user || !profile) redirect("/login");

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* PERBAIKAN: Mengirim parameter ULP ke komponen Sidebar */}
      <SidebarNav nama={profile.nama_lengkap} role={profile.role} ulp={profile.ulp} />
      
      <div 
        className="flex min-w-0 flex-1 flex-col relative"
        style={{
          backgroundImage: "url('/bg-batik-light.png')",
          backgroundSize: "400px",
          backgroundRepeat: "repeat",
          backgroundColor: "rgba(201, 213, 224, 0.9)", 
          backgroundBlendMode: "overlay"
        }}
      >
        <Topbar nama={profile.nama_lengkap} />
        
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 relative z-10">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
      
      <BottomNav role={profile.role} />
    </div>
  );
}
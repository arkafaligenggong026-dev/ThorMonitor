import { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  description: string;
  action?: ReactNode; // Untuk menaruh tombol (opsional)
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div 
      className="relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8 bg-slate-900 mb-8"
      style={{
        backgroundImage: "url('/bg-batik-dark.png')",
        backgroundSize: "1000px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundColor: "rgba(15, 23, 42, 0.3)",
      }}
    >
      {/* Dekorasi Cahaya Tambahan di Ujung Banner */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0091B5] opacity-20 blur-3xl" />
      
      <div className="relative z-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-300 sm:text-base">
          {description}
        </p>
      </div>
      
      {/* Area Tombol Kanan (Jika Ada) */}
      {action && (
        <div className="relative z-10">
          {action}
        </div>
      )}
    </div>
  );
}
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: APP_NAME || "ThorMonitor",
  description: APP_DESCRIPTION || "Manajemen Work Order Jaringan Distribusi",
  manifest: "/manifest.json", // 🔥 INI YANG BIKIN JADI APLIKASI PWA
};

export const viewport: Viewport = {
  themeColor: "#0A192F", // 🔥 WARNA BAR ATAS HP BIAR SENADA SAMA APLIKASI
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom in otomatis pas ngetik di HP
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
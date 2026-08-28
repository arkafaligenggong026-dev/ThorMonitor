import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pln.thormonitor',
  appName: 'ThorMonitor',
  webDir: 'public', // 🔥 Kita pakai folder public bawaan Next.js biar aman
  server: {
    url: 'http://10.21.20.102:3000', // 🔥 GANTI DENGAN IP LAPTOP LU PERSIS
    cleartext: true // Wajib true agar HTTP lokal diizinkan di HP
  }
};

export default config;
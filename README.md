# ⚡ ThorMonitor

**Sistem Manajemen Work Order (WO) Terintegrasi Berbasis Geotagging**
Aplikasi pelaporan & penanganan gangguan jaringan distribusi — PT PLN (Persero)

Dibangun sesuai PRD v2.0: **Next.js (App Router)** + **Supabase** (PostgreSQL + PostGIS, Auth, Storage, RLS) + **Tailwind CSS**.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Autentikasi & RBAC** | Login via NIP atau Email, tiga peran: Tim Inspeksi, Supervisor, Tim Pemeliharaan (Yantek) |
| **Pelaporan WO** | Tim Inspeksi membuat laporan lengkap: penyulang, deskripsi, kategori, urgensi |
| **Geotagging** | Titik koordinat GPS otomatis dari browser + reverse geocode alamat |
| **Foto Before/After** | Unggah foto kondisi awal & hasil kerja, langsung ke Supabase Storage |
| **Penugasan** | Supervisor menugaskan WO ke anggota Tim Pemeliharaan |
| **Verifikasi** | Supervisor menyetujui (tutup) atau menolak (kembali ke revisi) hasil kerja |
| **Dashboard** | Ringkasan statistik: Total, Menunggu Eksekusi, Dikerjakan, Selesai |
| **Peta GIS** | Peta interaktif (Leaflet.js) dengan pin warna sesuai status WO |
| **Riwayat** | Arsip pekerjaan selesai dengan komparasi foto Before-After |
| **PWA** | Bisa di-install ke homescreen + caching dasar untuk area blank spot |

Alur status: `Open → Assigned → In Progress → Resolved → Closed`
(kembali ke `In Progress` jika Supervisor menolak/minta revisi)

---

## 🚀 Mulai Cepat

### 1. Prasyarat
- Node.js 18.18+ (disarankan 20 LTS ke atas)
- Akun [Supabase](https://supabase.com) (gratis)

### 2. Buat Project Supabase
1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
2. Setelah project siap, buka **SQL Editor** → tempel seluruh isi file
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) → **Run**.
   Ini akan membuat tabel `profiles` & `work_orders`, ekstensi PostGIS, trigger, RLS policy,
   fungsi login-via-NIP, serta bucket Storage `wo-photos`.
3. Buka **Project Settings → API**, salin `Project URL` dan `anon public key`.

> **Opsional (mempercepat testing):** di **Authentication → Providers → Email**, matikan
> "Confirm email" supaya akun baru bisa langsung login tanpa verifikasi email.

### 3. Konfigurasi Environment
```bash
cp .env.local.example .env.local
```
Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dengan nilai dari langkah 2.

### 4. Install & Jalankan
```bash
npm install
npm run dev
```
Buka **http://localhost:3000**.

### 5. Buat Akun Pertama
Aplikasi belum ada data — daftar akun lewat halaman **`/register`** untuk masing-masing peran
(Tim Inspeksi, Supervisor, Tim Pemeliharaan) agar bisa mencoba seluruh alur kerja.

> Halaman registrasi publik ini memudahkan uji coba. Untuk produksi, sebaiknya pembuatan akun
> dikontrol oleh admin (lihat catatan di `src/lib/actions/auth.ts`).

---

## 🗂️ Struktur Proyek

```
thormonitor/
├── supabase/migrations/0001_init.sql   # Skema DB, RLS, storage policy
├── public/
│   ├── icons/                          # Ikon PWA
│   ├── sw.js                           # Service worker (cache-first aset, offline fallback)
│   └── offline.html                    # Halaman fallback saat offline
└── src/
    ├── middleware.ts                   # Refresh sesi Supabase + proteksi rute
    ├── app/
    │   ├── page.tsx                    # Landing page
    │   ├── login/, register/           # Autentikasi
    │   └── dashboard/                  # Area terproteksi (layout cek sesi)
    │       ├── page.tsx                # Dashboard + statistik
    │       ├── work-orders/            # Daftar, buat baru, detail WO
    │       ├── peta/                   # Peta GIS
    │       ├── riwayat/                # Arsip Before-After
    │       └── profil/
    ├── components/
    │   ├── ui/                         # Primitif (Button, Input, Dialog, Tabs, dst.)
    │   ├── work-order/                 # Form, kartu, aksi status, upload foto
    │   ├── map/                        # Wrapper Leaflet (vanilla, aman SSR)
    │   └── layout/                     # Sidebar, bottom nav, topbar
    └── lib/
        ├── supabase/                   # Client browser/server/middleware
        ├── actions/                    # Server Actions (auth, siklus hidup WO)
        ├── data.ts                     # Query baca (Server Components)
        └── types.ts, constants.ts, utils.ts
```

---

## ☁️ Deploy ke Vercel

1. Push folder ini ke repository GitHub/GitLab.
2. Import project di [vercel.com/new](https://vercel.com/new).
3. Tambahkan Environment Variables yang sama seperti `.env.local`.
4. Deploy — Vercel otomatis mendeteksi Next.js.
5. Jangan lupa jalankan migrasi SQL di project Supabase **production** (bisa memakai project
   yang sama dengan development, atau buat project terpisah untuk staging/production).

---

## 🔒 Keamanan

- Sesi disimpan lewat HTTP-only cookies (bukan `localStorage`), aman dari XSS.
- **Row Level Security (RLS)** aktif di semua tabel: peran & kepemilikan baris divalidasi di
  level database, bukan cuma di UI.
- Setiap Server Action memvalidasi ulang peran pengguna & status WO sebelum menulis ke database
  (defense in depth di luar RLS).
- Bucket foto bersifat publik untuk **baca**; hanya pengguna yang login yang bisa **mengunggah**.

## 📝 Catatan Pengembangan Lanjutan

- **Notifikasi** (email/push saat WO ditugaskan/diverifikasi) belum diimplementasikan — bisa
  ditambahkan lewat Supabase Edge Functions + Database Webhooks.
- **Sinkronisasi offline penuh** (mengisi laporan tanpa sinyal lalu sync otomatis) belum
  tersedia; PWA saat ini fokus pada caching baca (read) untuk halaman yang sudah pernah dibuka.
- Kategori gangguan (`src/lib/constants.ts`) bisa disesuaikan dengan master data aset PLN yang
  sesungguhnya.

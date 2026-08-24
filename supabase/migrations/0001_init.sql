-- =========================================================================
-- ThorMonitor — Skema Awal Database
-- Sistem Manajemen Work Order (WO) Terintegrasi Berbasis Geotagging
-- PT PLN (Persero)
--
-- Cara pakai: Buka Supabase Dashboard > SQL Editor > tempel isi file ini >
-- Run. Bisa juga lewat Supabase CLI: `supabase db push`.
-- =========================================================================

-- 1. EKSTENSI ------------------------------------------------------------
create extension if not exists postgis with schema public;
create extension if not exists pgcrypto; -- untuk gen_random_uuid()

-- 2. TABEL PROFILES --------------------------------------------------------
-- Menyimpan data tambahan pengguna di luar auth.users bawaan Supabase Auth,
-- termasuk NIP dan peran (role) untuk Role-Based Access Control (RBAC).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nip text not null unique,
  nama_lengkap text not null,
  role text not null check (role in ('tim_inspeksi', 'supervisor', 'tim_pemeliharaan')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Profil pengguna: NIP, nama, dan peran (RBAC) untuk tiap akun ThorMonitor.';

-- 3. SEQUENCE + TABEL WORK ORDERS ------------------------------------------
create sequence if not exists public.wo_number_seq start 1;

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  nomor_wo text not null unique default ('WO-' || lpad(nextval('public.wo_number_seq')::text, 6, '0')),

  -- FR-2.1: detail laporan
  nama_penyulang text not null,
  deskripsi text not null,
  kategori text not null,
  urgensi text not null check (urgensi in ('rendah', 'sedang', 'tinggi', 'kritis')),

  -- Alur status WO: open -> assigned -> in_progress -> resolved -> closed
  -- (resolved bisa kembali ke in_progress jika supervisor menolak/minta revisi)
  status text not null default 'open'
    check (status in ('open', 'assigned', 'in_progress', 'resolved', 'closed')),

  -- FR-2.2: Geotagging
  latitude double precision not null,
  longitude double precision not null,
  lokasi geography(Point, 4326), -- kolom spasial PostGIS, diisi otomatis lewat trigger di bawah
  alamat text,

  -- FR-2.3 & FR-2.5: Media Before/After
  foto_before_url text not null,
  foto_after_url text,

  -- Catatan revisi dari Supervisor saat verifikasi ditolak
  catatan_revisi text,

  -- Relasi antar pengguna sepanjang alur kerja
  dibuat_oleh uuid not null references public.profiles (id),
  ditugaskan_ke uuid references public.profiles (id),
  ditugaskan_oleh uuid references public.profiles (id),

  -- Jejak waktu tiap transisi status
  created_at timestamptz not null default now(),
  assigned_at timestamptz,
  started_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.work_orders is 'Work Order gangguan jaringan distribusi: dari laporan Tim Inspeksi sampai verifikasi Supervisor.';

create index if not exists work_orders_status_idx on public.work_orders (status);
create index if not exists work_orders_ditugaskan_ke_idx on public.work_orders (ditugaskan_ke);
create index if not exists work_orders_dibuat_oleh_idx on public.work_orders (dibuat_oleh);
create index if not exists work_orders_lokasi_gix on public.work_orders using gist (lokasi);

-- 4. TRIGGERS ----------------------------------------------------------

-- Sinkronkan kolom geography PostGIS dari latitude/longitude setiap kali
-- baris dibuat/diubah, supaya query spasial (jarak, radius, dsb) bisa
-- langsung memakai kolom `lokasi`.
create or replace function public.sync_wo_lokasi()
returns trigger
language plpgsql
as $$
begin
  new.lokasi := ST_SetSRID(ST_MakePoint(new.longitude, new.latitude), 4326)::geography;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_sync_wo_lokasi on public.work_orders;
create trigger trg_sync_wo_lokasi
  before insert or update on public.work_orders
  for each row execute function public.sync_wo_lokasi();

-- Buat baris profiles otomatis saat ada user baru mendaftar lewat Supabase
-- Auth (dipicu dari Server Action signup, lihat src/lib/actions/auth.ts).
-- Trigger ini sebagai jaring pengaman tambahan bila insert manual profil
-- gagal di sisi aplikasi.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nip, nama_lengkap, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nip', 'NIP-' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data ->> 'nama_lengkap', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'tim_inspeksi')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. FUNGSI LOGIN VIA NIP (FR-1.2) -----------------------------------------
-- Login Supabase Auth berbasis email; fungsi ini menerjemahkan NIP ->
-- email supaya pengguna bisa login pakai NIP maupun email (lihat
-- src/lib/actions/auth.ts). SECURITY DEFINER + hanya mengembalikan email
-- (bukan seluruh baris profil) supaya tetap aman dipanggil oleh peran anon.
create or replace function public.get_email_by_nip(nip_input text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  found_email text;
begin
  select u.email into found_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.nip = nip_input
  limit 1;

  return found_email;
end;
$$;

revoke all on function public.get_email_by_nip(text) from public;
grant execute on function public.get_email_by_nip(text) to anon, authenticated;

-- 6. ROW LEVEL SECURITY ---------------------------------------------------
alter table public.profiles enable row level security;
alter table public.work_orders enable row level security;

-- Helper: ambil role user yang sedang login (dipakai berulang di policy)
create or replace function public.current_role_name()
returns text
language sql
security definer set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---- Kebijakan PROFILES ----
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true); -- semua peran perlu melihat daftar Tim Pemeliharaan/Supervisor untuk penugasan & tampilan nama

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- ---- Kebijakan WORK ORDERS ----
-- FR-3.3 & UC_Riwayat: riwayat & log pekerjaan bisa dilihat ketiga peran
-- (transparan & mudah diaudit, sesuai tujuan bisnis PRD bagian 2).
drop policy if exists "wo_select_authenticated" on public.work_orders;
create policy "wo_select_authenticated"
  on public.work_orders for select
  to authenticated
  using (true);

-- Hanya Tim Inspeksi yang membuat WO baru (FR-2.1), dan hanya atas nama
-- dirinya sendiri.
drop policy if exists "wo_insert_tim_inspeksi" on public.work_orders;
create policy "wo_insert_tim_inspeksi"
  on public.work_orders for insert
  to authenticated
  with check (
    dibuat_oleh = auth.uid()
    and public.current_role_name() = 'tim_inspeksi'
  );

-- Supervisor boleh mengubah WO manapun (penugasan FR-2.4 & verifikasi
-- FR-3.1). Tim Pemeliharaan hanya boleh mengubah WO yang ditugaskan
-- kepada dirinya (FR-2.5). Validasi transisi status yang presisi
-- ditegakkan di lapisan Server Action (defense in depth).
drop policy if exists "wo_update_supervisor" on public.work_orders;
create policy "wo_update_supervisor"
  on public.work_orders for update
  to authenticated
  using (public.current_role_name() = 'supervisor')
  with check (public.current_role_name() = 'supervisor');

drop policy if exists "wo_update_tim_pemeliharaan" on public.work_orders;
create policy "wo_update_tim_pemeliharaan"
  on public.work_orders for update
  to authenticated
  using (
    public.current_role_name() = 'tim_pemeliharaan'
    and ditugaskan_ke = auth.uid()
  )
  with check (
    public.current_role_name() = 'tim_pemeliharaan'
    and ditugaskan_ke = auth.uid()
  );

-- 7. SUPABASE STORAGE (NFR-2: foto Before/After) ---------------------------
insert into storage.buckets (id, name, public)
values ('wo-photos', 'wo-photos', true)
on conflict (id) do nothing;

drop policy if exists "wo_photos_public_read" on storage.objects;
create policy "wo_photos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'wo-photos');

drop policy if exists "wo_photos_authenticated_upload" on storage.objects;
create policy "wo_photos_authenticated_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'wo-photos');

drop policy if exists "wo_photos_authenticated_update" on storage.objects;
create policy "wo_photos_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'wo-photos' and owner = auth.uid());

-- =========================================================================
-- Selesai. Setelah menjalankan migrasi ini, buat akun pertama lewat
-- halaman /register pada aplikasi (lihat README.md bagian "Mulai Cepat").
-- =========================================================================

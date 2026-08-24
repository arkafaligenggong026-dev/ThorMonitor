import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua rute KECUALI file statis & aset gambar,
     * supaya tidak menambah overhead pada permintaan aset.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)",
  ],
};

import { NextResponse } from "next/server";
import { requireActiveAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

/* Same idea as .../download, but without `download` — no
   Content-Disposition header, so the browser renders it inline
   instead of saving it. Only for images (the <img> thumbnail on the
   source's detail page); anything else redirects to the real
   download route instead of inline-rendering arbitrary file types. */
export async function GET(request, { params }) {
  const me = await requireActiveAdmin();
  if (!me) return NextResponse.redirect(new URL("/login", request.url));

  const { id } = await params;
  const admin = createAdminClient();

  const { data: resource } = await admin
    .from("resources")
    .select("storage_key, content_type")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!resource?.storage_key) {
    return NextResponse.redirect(new URL("/content/sources?error=missing-file", request.url));
  }
  if (!resource.content_type?.startsWith("image/")) {
    return NextResponse.redirect(new URL(`/api/sources/${id}/download`, request.url));
  }

  const { data, error } = await admin.storage.from("resources").createSignedUrl(resource.storage_key, 60);
  if (error || !data) {
    return NextResponse.redirect(new URL("/content/sources?error=download-failed", request.url));
  }

  return NextResponse.redirect(data.signedUrl);
}

import { NextResponse } from "next/server";
import { requireActiveAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";

/* A real HTTP redirect instead of a client-side window.open() — the
   previous version awaited a server action before calling window.open,
   which Safari (especially the standalone home-screen app) no longer
   treats as user-initiated and leaves as a blank tab. A plain <a
   target="_blank"> hitting this route is native browser navigation:
   no popup-blocker heuristics involved, works the same in a regular
   tab or the installed app. */
export async function GET(request, { params }) {
  const me = await requireActiveAdmin();
  if (!me) return NextResponse.redirect(new URL("/login", request.url));

  const { id } = await params;
  const admin = createAdminClient();

  const { data: resource } = await admin
    .from("resources")
    .select("storage_key, file_name")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!resource?.storage_key) {
    return NextResponse.redirect(new URL("/content/sources?error=missing-file", request.url));
  }

  /* Without `download`, Supabase serves the file inline with whatever
     content-type it inferred — a .txt note opened this way isn't a
     "page", it's the browser's raw plain-text viewer, which in dark
     mode is just white text on a black rectangle. `download` adds a
     Content-Disposition: attachment header instead, so the browser
     saves the file like a normal download rather than navigating to
     display it. */
  const { data, error } = await admin.storage
    .from("resources")
    .createSignedUrl(resource.storage_key, 60, { download: resource.file_name || true });
  if (error || !data) {
    return NextResponse.redirect(new URL("/content/sources?error=download-failed", request.url));
  }

  return NextResponse.redirect(data.signedUrl);
}

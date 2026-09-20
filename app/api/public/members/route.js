import { createAdminClient } from "@/lib/supabase/admin";
import { corsHeaders, originAllowed } from "@/lib/public-cors";

/* Read-only, public, unauthenticated — the future public-site Members
   section reads from here. Deliberately excludes phone: that field is
   for officers to reach each other, never for public display. RLS on
   `members` already restricts anon reads the same way; this endpoint
   exists so the public *static* site (no direct DB access) can reach
   the same data over plain HTTP. */

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function GET(request) {
  const origin = request.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" };

  if (!originAllowed(origin)) {
    return Response.json({ error: "Origin not allowed." }, { status: 403, headers });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("members")
    .select("id, name, role, major, focus")
    .eq("published", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    return Response.json({ error: "Could not load members." }, { status: 500, headers });
  }

  return Response.json({ members: data ?? [] }, { status: 200, headers });
}

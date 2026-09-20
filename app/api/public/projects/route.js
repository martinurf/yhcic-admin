import { createAdminClient } from "@/lib/supabase/admin";
import { corsHeaders, originAllowed } from "@/lib/public-cors";

/* Read-only, public, unauthenticated — the future public-site Projects
   section reads from here. Same shape as /api/public/members. */

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
    .from("projects")
    .select("id, title, status, code, body")
    .eq("published", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  if (error) {
    return Response.json({ error: "Could not load projects." }, { status: 500, headers });
  }

  return Response.json({ projects: data ?? [] }, { status: 200, headers });
}

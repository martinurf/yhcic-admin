import { createAdminClient } from "@/lib/supabase/admin";

/* Owned membership-application intake. The public site posts here
   instead of (or alongside, during a transition) Formspree. RLS has
   no insert policy on `applications` for any client role — this is
   the only way a row gets created, and it always goes through the
   service-role client below, after this handler's own validation. */

const ALLOWED_ORIGINS = ["https://yhcic.vercel.app", "https://martinurf.github.io"];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  const headers = { ...corsHeaders(origin), "Content-Type": "application/json" };

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return Response.json({ error: "Origin not allowed." }, { status: 403, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400, headers });
  }

  // Honeypot: bots fill hidden fields. Pretend success, insert nothing.
  if (body._gotcha) {
    return Response.json({ ok: true }, { status: 200, headers });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const gradYear = String(body.gradYear || "").trim();
  const major = String(body.major || "").trim();
  const referral = body.referral ? String(body.referral).trim() : null;
  const experience = body.experience ? String(body.experience).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;

  if (name.length < 2) return Response.json({ error: "Name is required." }, { status: 400, headers });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400, headers });
  }
  if (!gradYear) return Response.json({ error: "Graduation year is required." }, { status: 400, headers });
  if (major.length < 2) return Response.json({ error: "Major is required." }, { status: 400, headers });

  const admin = createAdminClient();
  const { data: application, error } = await admin
    .from("applications")
    .insert({ name, email, grad_year: gradYear, major, referral, experience, phone })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: "Could not save your application. Please try again." }, { status: 500, headers });
  }

  notifyOfficers(admin, application.id, { name, email, gradYear, major, referral, experience, phone }).catch(() => {});

  return Response.json({ ok: true }, { status: 200, headers });
}

/* Best-effort notification — the application is already safely stored
   by the time this runs. Failure here is logged on the row itself
   (notification_status/notification_error_code), never surfaced to
   the applicant and never retried inline. */
async function notifyOfficers(admin, id, data) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.APPLICATION_NOTIFY_EMAIL;
  if (!key || !to) return;

  const text = [
    `New YHCIC membership application — ${data.name}`,
    "",
    `Email: ${data.email}`,
    `Graduation year: ${data.gradYear}`,
    `Major: ${data.major}`,
    `Heard about us via: ${data.referral || "—"}`,
    `Phone: ${data.phone || "—"}`,
    "",
    "Previous experience:",
    data.experience || "—",
  ].join("\n");

  let ok = false;
  let errorCode = null;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // onboarding@resend.dev works without a verified domain; swap in a
        // yhcic.edu sender once a domain is verified in the Resend dashboard.
        from: "YHCIC Applications <onboarding@resend.dev>",
        to,
        subject: `New YHCIC application — ${data.name}`,
        text,
      }),
    });
    ok = res.ok;
    if (!ok) errorCode = String(res.status);
  } catch {
    errorCode = "network_error";
  }

  await admin
    .from("applications")
    .update({
      notification_status: ok ? "sent" : "failed",
      notification_attempts: 1,
      last_notification_attempt_at: new Date().toISOString(),
      notification_error_code: errorCode,
    })
    .eq("id", id);
}

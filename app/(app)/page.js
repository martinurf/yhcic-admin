import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function countRows(supabase, table, filters = {}) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count } = await query;
  return count ?? 0;
}

const SOON_TILES = [
  { key: "announcements", title: "Announcements", eyebrow: "Content" },
  { key: "projects", title: "Projects", eyebrow: "Content" },
  { key: "goals", title: "Goals", eyebrow: "Content" },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("admin_profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }
  const firstName = (profile?.display_name || profile?.username || "").split(" ")[0];

  const [pending, accepted, rejected, memberCount, memberPublished] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "applications", { status: "accepted" }),
    countRows(supabase, "applications", { status: "rejected" }),
    countRows(supabase, "members"),
    countRows(supabase, "members", { published: true }),
  ]);

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Overview</p>
          <h1 className="page__title page__title--desktop">Dashboard</h1>
          <h1 className="page__title page__title--mobile">Welcome, {firstName || "officer"}</h1>
        </div>
      </div>

      <div className="tiles">
        <Link href="/content/members" className="tile">
          <p className="tile__eyebrow">Content</p>
          <h2 className="tile__title">Members</h2>
          <p className="tile__stat">
            <strong>{memberCount}</strong> total <span className="muted">· {memberPublished} published</span>
          </p>
          <span className="tile__arrow" aria-hidden="true">&rarr;</span>
        </Link>

        <Link href="/applications" className="tile">
          <p className="tile__eyebrow">Membership</p>
          <h2 className="tile__title">Applications</h2>
          <p className="tile__stat">
            <strong>{pending}</strong> pending
            {(accepted || rejected) ? (
              <span className="muted"> · {accepted} accepted · {rejected} rejected</span>
            ) : null}
          </p>
          <span className="tile__arrow" aria-hidden="true">&rarr;</span>
        </Link>

        {SOON_TILES.map((t) => (
          <div key={t.key} className="tile tile--soon">
            <p className="tile__eyebrow">{t.eyebrow}</p>
            <h2 className="tile__title">{t.title}</h2>
            <p className="tile__stat muted">Coming soon</p>
            <span className="tile__soon">Soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
